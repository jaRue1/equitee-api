import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ClaimEquipmentDto {
  @ApiProperty()
  @IsUUID()
  claimer_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}