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
    // For now, use text generation with tool descriptions and parse the response
    // In production, you'd use function calling when available
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

    // Try to parse tool calls from the response
    let toolCalls: FunctionCall[] = [];
    try {
      if (response.includes('"action": "use_tool"')) {
        const toolCallMatch = response.match(/\{[^}]*"action":\s*"use_tool"[^}]*\}/);
        if (toolCallMatch) {
          const toolCall = JSON.parse(toolCallMatch[0]);
          toolCalls = [{
            name: toolCall.tool,
            arguments: toolCall.parameters || {},
          }];
        }
      }
    } catch (e) {
      // If parsing fails, just return the text response
    }

    return {
      content: response,
      toolCalls,
    };
  }
}