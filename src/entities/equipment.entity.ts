import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';

export enum EquipmentType {
  DRIVER = 'driver',
  WOODS = 'woods',
  IRONS = 'irons',
  WEDGES = 'wedges',
  PUTTER = 'putter',
  BAG = 'bag',
}

export enum EquipmentCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
}

export enum EquipmentStatus {
  AVAILABLE = 'available',
  PENDING = 'pending',
  DONATED = 'donated',
  SOLD = 'sold',
}

export class Equipment {
  @ApiProperty()
  id: string;

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
  @IsEnum(EquipmentStatus)
  status: EquipmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  location_lat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  location_lng?: number;

  @ApiProperty()
  created_at: Date;
}