import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AIAgentService } from './ai-agent.service';
import { AgentQueryRequest, AgentResponse } from './dto/ai.dto';

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(private readonly aiAgentService: AIAgentService) {}

  @Post('query')
  @ApiOperation({
    summary: 'Process AI agent query',
    description: 'Send a query to the AI golf coach agent with spatial awareness and tool integration'
  })
  @ApiBody({
    description: 'AI agent query with context',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'User query/question', example: 'Find me golf courses near Miami Beach' },
        userId: { type: 'string', description: 'Optional user ID' },
        userLocation: {
          type: 'object',
          properties: {
            lat: { type: 'number', example: 25.7617 },
            lng: { type: 'number', example: -80.1918 }
          },
          required: ['lat', 'lng']
        },
        conversationHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string', enum: ['user', 'assistant'] },
              content: { type: 'string' }
            }
          },
        },
        userProfile: {
          type: 'object',
          properties: {
            experienceLevel: { type: 'string', example: 'beginner' },
            budget: { type: 'number', example: 100 },
            age: { type: 'number', example: 25 },
            hasEquipment: { type: 'boolean', example: false },
            hasTransportation: { type: 'boolean', example: true }
          },
        }
      },
      required: ['query', 'userLocation']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'AI agent response with tool results and map highlights',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'I found 3 golf courses near you! Here are the best options...' },
        toolInvocations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              toolName: { type: 'string', example: 'searchCourses' },
              toolCallId: { type: 'string', example: 'search_courses_1' },
              args: { type: 'object' },
              result: { type: 'object' }
            }
          }
        },
        mapHighlights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              lat: { type: 'number' },
              lng: { type: 'number' },
              type: { type: 'string', enum: ['course', 'program', 'mentor', 'equipment'] },
              name: { type: 'string' },
              description: { type: 'string' },
              metadata: { type: 'object' }
            }
          }
        },
        followUpQuestions: {
          type: 'array',
          items: { type: 'string' },
          example: ['Would you like details about any specific course?', 'Need help with transportation?']
        },
        fallbackMessage: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or missing required parameters'
  })
  async processAgentQuery(@Body() request: AgentQueryRequest): Promise<AgentResponse> {
    try {
      const response = await this.aiAgentService.processAgentQuery(
        request.query,
        {
          userId: request.userId,
          userLocation: request.userLocation,
          conversationHistory: request.conversationHistory || [],
          userProfile: request.userProfile
        }
      );

      return response;
    } catch (error) {
      return {
        success: false,
        message: 'I\'m having trouble right now. Can you try asking in a different way?',
        fallbackMessage: error.message
      };
    }
  }
}