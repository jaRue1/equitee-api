import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';

export enum PartnerRequestStatus {
  ACTIVE = 'active',
  MATCHED = 'matched',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export class PartnerRequest {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  @IsUUID()
  course_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  preferred_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferred_time?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skill_level?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ enum: PartnerRequestStatus, default: PartnerRequestStatus.ACTIVE })
  @IsEnum(PartnerRequestStatus)
  status: PartnerRequestStatus;

  @ApiProperty()
  created_at: Date;
}