import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';
import { EquipmentType, EquipmentCondition, EquipmentStatus } from '../../../entities/equipment.entity';

export class CreateEquipmentDto {
  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EquipmentType })
  @IsEnum(EquipmentType)
  equipment_type: EquipmentType;

  @ApiProperty({ enum: EquipmentCondition })
  @IsEnum(EquipmentCondition)
  condition: EquipmentCondition;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  age_range?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ enum: EquipmentStatus, default: EquipmentStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus = EquipmentStatus.AVAILABLE;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  location_lat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  location_lng?: number;
}