import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export enum MessageType {
  TEXT = 'text',
  LOCATION = 'location',
  SELECTION = 'selection',
  RECOMMENDATION = 'recommendation',
}

export class ChatMessage {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsUUID()
  conversation_id: string;

  @ApiProperty({ enum: MessageSender })
  @IsEnum(MessageSender)
  sender: MessageSender;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  message_type: MessageType;

  @ApiProperty({ required: false, type: 'object' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  created_at: Date;
}