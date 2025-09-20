import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';

export enum MemberStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  DECLINED = 'declined',
  CANCELLED = 'cancelled',
}

export class GolfGroupMember {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsUUID()
  group_id: string;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  joined_at: Date;

  @ApiProperty({ enum: MemberStatus, default: MemberStatus.CONFIRMED })
  @IsEnum(MemberStatus)
  status: MemberStatus;
}