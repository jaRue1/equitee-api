import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { EquipmentType, EquipmentCondition, EquipmentStatus } from '../../../entities/equipment.entity';

export class EquipmentFiltersDto {
  @ApiProperty({ enum: EquipmentType, required: false })
  @IsOptional()
  @IsEnum(EquipmentType)
  equipment_type?: EquipmentType;

  @ApiProperty({ enum: EquipmentCondition, required: false })
  @IsOptional()
  @IsEnum(EquipmentCondition)
  condition?: EquipmentCondition;

  @ApiProperty({ enum: EquipmentStatus, required: false })
  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @ApiProperty({ required: false, description: 'Maximum price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  max_price?: number;

  @ApiProperty({ required: false, description: 'Minimum price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  min_price?: number;

  @ApiProperty({ required: false, description: 'Latitude for location-based search' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  lat?: number;

  @ApiProperty({ required: false, description: 'Longitude for location-based search' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  lng?: number;

  @ApiProperty({ required: false, description: 'Search radius in miles', default: 25 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseFloat(value))
  radius?: number = 25;
}