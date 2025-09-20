import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, IsEnum, Min, Max } from 'class-validator';

export enum GolfGroupStatus {
  OPEN = 'open',
  FULL = 'full',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export class GolfGroup {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsUUID()
  course_id: string;

  @ApiProperty()
  @IsUUID()
  created_by: string;

  @ApiProperty()
  @IsDateString()
  scheduled_date: string;

  @ApiProperty()
  @IsString()
  scheduled_time: string;

  @ApiProperty({ default: 4 })
  @IsNumber()
  @Min(2)
  @Max(6)
  max_members: number;

  @ApiProperty({ default: 1 })
  @IsNumber()
  @Min(1)
  current_members: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skill_level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: GolfGroupStatus, default: GolfGroupStatus.OPEN })
  @IsEnum(GolfGroupStatus)
  status: GolfGroupStatus;

  @ApiProperty()
  created_at: Date;
}