import { Injectable } from '@nestjs/common';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

interface FunctionCall {
  name: string;
  arguments: any;
}

@Injectable()
export class AIService {
  private readonly openaiProvider = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private readonly anthropicProvider = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  private getModel(model: 'openai' | 'anthropic' = 'openai') {
    if (model === 'openai') {
      return this.openaiProvider('gpt-4-turbo');
    } else {
      // Try the latest Claude 3.5 Sonnet model
      return this.anthropicProvider('claude-3-5-sonnet-latest');
    }
  }

  async generateChatResponse(
    conversation: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    model: 'openai' | 'anthropic' = 'openai'
  ): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.getModel(model),
        messages: conversation,
      });

      return text;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async generateWithTools(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    availableTools: any[],
    model: 'openai' | 'anthropic' = 'openai'
  ): Promise<{
    content: string;
    toolCalls: FunctionCall[];
  }> {
    try {
      // Convert tools to proper function calling format
      const tools = availableTools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: 'object',
            properties: this.convertZodToJsonSchema(tool.parameters),
            required: this.getRequiredFields(tool.parameters),
          },
        },
      }));

      const { generateText } = await import('ai');

      // Convert tools to proper SDK format for Anthropic
      const toolsObject: Record<string, any> = {};
      availableTools.forEach(tool => {
        toolsObject[tool.name] = {
          description: tool.description,
          parameters: tool.parameters, // Pass Zod schema directly - the SDK handles it
        };
      });

      const result = await generateText({
        model: this.getModel(model),
        messages,
        tools: toolsObject,
        toolChoice: 'auto',
      });

      // Extract tool calls from the result
      const toolCalls: FunctionCall[] = [];

      if (result.toolCalls && result.toolCalls.length > 0) {
        for (const toolCall of result.toolCalls) {
          const toolCallAny = toolCall as any;
          toolCalls.push({
            name: toolCall.toolName,
            arguments: toolCallAny.args || toolCallAny.arguments || {},
          });
        }
      }

      return {
        content: result.text || '',
        toolCalls,
      };
    } catch (error) {
      console.error('Function calling failed, falling back to text parsing:', error);

      // Fallback to original text-based approach
      return this.generateWithToolsTextFallback(messages, availableTools, model);
    }
  }

  private async generateWithToolsTextFallback(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    availableTools: any[],
    model: 'openai' | 'anthropic' = 'openai'
  ): Promise<{
    content: string;
    toolCalls: FunctionCall[];
  }> {
    const toolDescriptions = availableTools.map(tool =>
      `- ${tool.name}: ${tool.description}`
    ).join('\n');

    const systemMessage = messages.find(m => m.role === 'system');
    const updatedSystemMessage = `${systemMessage?.content || ''}

Available tools:
${toolDescriptions}

When you need to use a tool, respond with a JSON object containing:
{
  "action": "use_tool",
  "tool": "tool_name",
  "parameters": { ... }
}

Otherwise, respond normally with helpful information.`;

    const updatedMessages = [
      { role: 'system' as const, content: updatedSystemMessage },
      ...messages.filter(m => m.role !== 'system'),
    ];

    const response = await this.generateChatResponse(updatedMessages, model);

    // Enhanced tool call parsing with better JSON extraction
    let toolCalls: FunctionCall[] = [];
    try {
      // Look for complete JSON objects that contain tool calls
      // Use a more sophisticated regex to capture complete JSON objects
      const jsonPattern = /\{[^{}]*"action":\s*"use_tool"[^{}]*(?:\{[^{}]*\}[^{}]*)?\}/g;
      let jsonMatches = response.match(jsonPattern);

      // If that doesn't work, try extracting everything between { and } that contains action
      if (!jsonMatches) {
        const lines = response.split('\n');
        let jsonString = '';
        let bracketCount = 0;
        let capturing = false;

        for (const line of lines) {
          if (line.includes('"action"') && line.includes('"use_tool"')) {
            capturing = true;
            jsonString = '';
          }

          if (capturing) {
            jsonString += line;
            bracketCount += (line.match(/\{/g) || []).length;
            bracketCount -= (line.match(/\}/g) || []).length;

            if (bracketCount === 0 && jsonString.includes('"action"')) {
              jsonMatches = [jsonString];
              break;
            }
          }
        }
      }

      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            // Clean up the JSON string
            let cleanJson = match.trim();

            // Try to parse as-is first
            let toolCall;
            try {
              toolCall = JSON.parse(cleanJson);
            } catch {
              // If that fails, try to extract just the JSON part
              const startIndex = cleanJson.indexOf('{');
              const lastIndex = cleanJson.lastIndexOf('}');
              if (startIndex !== -1 && lastIndex !== -1) {
                cleanJson = cleanJson.substring(startIndex, lastIndex + 1);
                toolCall = JSON.parse(cleanJson);
              }
            }

            if (toolCall && toolCall.action === 'use_tool' && toolCall.tool) {
              toolCalls.push({
                name: toolCall.tool,
                arguments: toolCall.parameters || {},
              });
              console.log('Successfully parsed tool call:', toolCall.tool, toolCall.parameters);
            }
          } catch (parseError) {
            console.warn('Failed to parse tool call:', match, parseError);
          }
        }
      }
    } catch (e) {
      console.warn('Tool call parsing failed:', e);
    }

    return {
      content: response,
      toolCalls,
    };
  }

  private convertZodToJsonSchema(zodSchema: any): any {
    // Basic conversion from Zod schema to JSON Schema
    // This is a simplified implementation
    if (!zodSchema || !zodSchema._def) {
      return {};
    }

    const properties: any = {};

    try {
      // Handle Zod schema shape - check if it's a function or object
      let shape = zodSchema._def.shape;
      if (typeof shape === 'function') {
        shape = shape();
      }

      if (shape && typeof shape === 'object') {
        for (const [key, value] of Object.entries(shape)) {
          const field = value as any;
          if (field._def?.typeName === 'ZodString') {
            properties[key] = { type: 'string' };
          } else if (field._def?.typeName === 'ZodNumber') {
            properties[key] = { type: 'number' };
          } else if (field._def?.typeName === 'ZodBoolean') {
            properties[key] = { type: 'boolean' };
          } else if (field._def?.typeName === 'ZodObject') {
            properties[key] = {
              type: 'object',
              properties: this.convertZodToJsonSchema(field),
            };
          } else if (field._def?.typeName === 'ZodArray') {
            properties[key] = {
              type: 'array',
              items: this.convertZodToJsonSchema(field._def.type),
            };
          } else {
            properties[key] = { type: 'string' }; // fallback
          }
        }
      }
    } catch (error) {
      console.warn('Failed to convert Zod schema to JSON schema:', error);
      // Return basic schema as fallback
      return {
        location: { type: 'object' },
        budget: { type: 'number' },
        radius: { type: 'number' },
      };
    }

    return properties;
  }

  private getRequiredFields(zodSchema: any): string[] {
    if (!zodSchema || !zodSchema._def || !zodSchema._def.shape) {
      return [];
    }

    const required: string[] = [];
    try {
      // Handle Zod schema shape - check if it's a function or object
      let shape = zodSchema._def.shape;
      if (typeof shape === 'function') {
        shape = shape();
      }

      if (shape && typeof shape === 'object') {
        for (const [key, value] of Object.entries(shape)) {
          const field = value as any;
          if (!field._def?.typeName?.includes('Optional')) {
            required.push(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get required fields from Zod schema:', error);
      return [];
    }

    return required;
  }
}