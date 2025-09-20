import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsInt, Min, Max } from 'class-validator';

export class YouthProgram {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  location_lat?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  location_lng?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(18)
  age_min?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(18)
  age_max?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_per_session?: number;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  schedule_days?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  equipment_provided: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  transportation_available: boolean;

  @ApiProperty({ required: false, type: 'object' })
  @IsOptional()
  contact_info?: Record<string, any>;

  @ApiProperty()
  created_at: Date;
}