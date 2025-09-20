import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { StartConversationRequest, SendMessageRequest, ConversationResponse, MessageResponse } from './dto/chat.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  @ApiOperation({
    summary: 'Start a new chat conversation',
    description: 'Initialize a new conversation with the AI golf coach'
  })
  @ApiBody({
    description: 'Conversation initialization parameters',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'Optional user ID' },
        userLocation: {
          type: 'object',
          properties: {
            lat: { type: 'number', example: 25.7617 },
            lng: { type: 'number', example: -80.1918 }
          },
          required: ['lat', 'lng']
        }
      },
      required: ['userLocation']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation started successfully',
    schema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string' },
        message: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        mode: { type: 'string' }
      }
    }
  })
  async startConversation(@Body() request: StartConversationRequest): Promise<ConversationResponse> {
    return await this.chatService.startConversation(request.userLocation, request.userId);
  }

  @Post('message')
  @ApiOperation({
    summary: 'Send a message in an existing conversation',
    description: 'Send a user message and receive AI response'
  })
  @ApiBody({
    description: 'Message to send',
    schema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', description: 'Conversation UUID' },
        message: { type: 'string', description: 'User message text' },
        metadata: { type: 'object', description: 'Optional metadata' }
      },
      required: ['conversationId', 'message']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Message processed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } },
        nextStep: {
          type: 'object',
          properties: {
            step: { type: 'string' },
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } }
          },
        },
        recommendations: { type: 'array' },
        mapHighlights: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              lat: { type: 'number' },
              lng: { type: 'number' },
              type: { type: 'string' },
              name: { type: 'string' }
            }
          },
        }
      }
    }
  })
  async sendMessage(@Body() request: SendMessageRequest): Promise<MessageResponse> {
    return await this.chatService.processMessage(
      request.conversationId,
      request.message,
      request.metadata
    );
  }

  @Get('conversation/:conversationId/history')
  @ApiOperation({
    summary: 'Get conversation message history',
    description: 'Retrieve all messages from a specific conversation'
  })
  @ApiParam({ name: 'conversationId', description: 'Conversation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Conversation history retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          conversation_id: { type: 'string' },
          sender: { type: 'string', enum: ['user', 'ai'] },
          message: { type: 'string' },
          message_type: { type: 'string' },
          metadata: { type: 'object' },
          created_at: { type: 'string' }
        }
      }
    }
  })
  async getConversationHistory(@Param('conversationId') conversationId: string) {
    return await this.chatService.getConversationHistory(conversationId);
  }

  @Get('user/:userId/conversations')
  @ApiOperation({
    summary: 'Get user\'s conversation list',
    description: 'Retrieve all conversations for a specific user'
  })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'User conversations retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          current_step: { type: 'string' },
          mode: { type: 'string' },
          created_at: { type: 'string' },
          updated_at: { type: 'string' }
        }
      }
    }
  })
  async getUserConversations(@Param('userId') userId: string) {
    return await this.chatService.getUserConversations(userId);
  }
}