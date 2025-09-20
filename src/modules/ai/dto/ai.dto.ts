import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsArray, IsObject, IsNumber } from 'class-validator';

export class AgentQueryRequest {
  @ApiProperty()
  @IsString()
  query: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty()
  @IsObject()
  userLocation: { lat: number; lng: number };

  @ApiProperty({ required: false, type: 'array' })
  @IsOptional()
  @IsArray()
  conversationHistory?: Array<{
    role: string;
    content: string;
  }>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  userProfile?: {
    experienceLevel?: string;
    budget?: number;
    age?: number;
    hasEquipment?: boolean;
    hasTransportation?: boolean;
  };
}

export class ToolInvocation {
  @ApiProperty()
  toolName: string;

  @ApiProperty()
  toolCallId: string;

  @ApiProperty()
  args: any;

  @ApiProperty()
  result: any;
}

export class MapHighlight {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;

  @ApiProperty()
  type: 'course' | 'program' | 'mentor' | 'equipment';

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class AgentResponse {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false, type: [ToolInvocation] })
  @IsOptional()
  @IsArray()
  toolInvocations?: ToolInvocation[];

  @ApiProperty({ required: false, type: [MapHighlight] })
  @IsOptional()
  @IsArray()
  mapHighlights?: MapHighlight[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  followUpQuestions?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fallbackMessage?: string;
}