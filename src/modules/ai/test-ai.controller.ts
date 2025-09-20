import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AIService } from './ai.service';

@ApiTags('ai-test')
@Controller('ai-test')
export class TestAIController {
  constructor(private readonly aiService: AIService) {}

  @Post('simple')
  @ApiOperation({ summary: 'Test simple AI text generation' })
  async testSimpleAI(@Body() body: { message: string; model?: 'openai' | 'anthropic' }) {
    try {
      const response = await this.aiService.generateChatResponse([
        { role: 'system', content: 'You are a helpful golf assistant. Keep responses brief and friendly.' },
        { role: 'user', content: body.message },
      ], body.model || 'openai');

      return {
        success: true,
        response,
        model: body.model || 'openai',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: body.model || 'openai',
      };
    }
  }
}