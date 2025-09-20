import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, IsObject } from 'class-validator';

export class StartConversationRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty()
  @IsObject()
  userLocation: { lat: number; lng: number };
}

export class SendMessageRequest {
  @ApiProperty()
  @IsUUID()
  conversationId: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ConversationResponse {
  @ApiProperty()
  conversationId: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty()
  mode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class MessageResponse {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  nextStep?: {
    step: string;
    question: string;
    options?: string[];
  };

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  recommendations?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  mapHighlights?: Array<{
    id: string;
    lat: number;
    lng: number;
    type: 'course' | 'program' | 'mentor';
    name: string;
  }>;
}