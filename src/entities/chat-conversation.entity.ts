import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export enum ConversationMode {
  ONBOARDING = 'onboarding',
  AI_CONSULTANT = 'ai_consultant',
}

export enum ConversationStep {
  EXPERIENCE = 'experience',
  SKILL_LEVEL = 'skill_level',
  BUDGET = 'budget',
  RECOMMENDATIONS = 'recommendations',
  AI_MODE = 'ai_mode',
}

export class ChatConversation {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty({ required: false, type: 'object' })
  @IsOptional()
  conversation_state?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  current_step?: string;

  @ApiProperty({ required: false, type: 'object' })
  @IsOptional()
  user_location?: { lat: number; lng: number };

  @ApiProperty({ enum: ConversationMode, default: ConversationMode.ONBOARDING })
  @IsEnum(ConversationMode)
  mode: ConversationMode;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}