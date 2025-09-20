import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsUUID, IsDateString, IsEnum, IsArray, Min, Max } from 'class-validator';
import { GolfGroupStatus } from '../../../entities/golf-group.entity';
import { PartnerRequestStatus } from '../../../entities/partner-request.entity';

export class CreateGolfGroupRequest {
  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty()
  @IsUUID()
  createdBy: string;

  @ApiProperty()
  @IsDateString()
  scheduledDate: string;

  @ApiProperty()
  @IsString()
  scheduledTime: string;

  @ApiProperty({ default: 4 })
  @IsNumber()
  @Min(2)
  @Max(6)
  maxPlayers: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skillLevel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class JoinGolfGroupRequest {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CreatePartnerRequestRequest {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  preferredTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skillLevel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class FindPlayingPartnersRequest {
  @ApiProperty()
  @IsUUID()
  courseId: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  skillLevel?: string;

  @ApiProperty({ required: false, default: 25 })
  @IsOptional()
  @IsNumber()
  maxDistance?: number;
}

export class GolfGroupWithDetails {
  @ApiProperty()
  id: string;

  @ApiProperty()
  course_id: string;

  @ApiProperty()
  created_by: string;

  @ApiProperty()
  scheduled_date: string;

  @ApiProperty()
  scheduled_time: string;

  @ApiProperty()
  max_members: number;

  @ApiProperty()
  current_members: number;

  @ApiProperty({ required: false })
  skill_level?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: GolfGroupStatus })
  status: GolfGroupStatus;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ required: false })
  course?: {
    name: string;
    address: string;
  };

  @ApiProperty({ required: false })
  creator?: {
    name: string;
  };

  @ApiProperty({ required: false, type: 'array' })
  members?: Array<{
    id: string;
    user_id: string;
    user: {
      name: string;
    };
    status: string;
    joined_at: Date;
  }>;
}

export class PartnerRequestWithDetails {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  course_id: string;

  @ApiProperty({ required: false })
  preferred_date?: string;

  @ApiProperty({ required: false })
  preferred_time?: string;

  @ApiProperty({ required: false })
  skill_level?: string;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ enum: PartnerRequestStatus })
  status: PartnerRequestStatus;

  @ApiProperty()
  created_at: Date;

  @ApiProperty({ required: false })
  user?: {
    name: string;
    golf_experience: string;
  };

  @ApiProperty({ required: false })
  course?: {
    name: string;
    address: string;
  };
}

export class PlayingPartnersResponse {
  @ApiProperty({ type: [GolfGroupWithDetails] })
  groups: GolfGroupWithDetails[];

  @ApiProperty({ type: [PartnerRequestWithDetails] })
  individuals: PartnerRequestWithDetails[];
}