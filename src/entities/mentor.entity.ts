import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsUUID, IsInt, Min, Max } from 'class-validator';

export class Mentor {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  experience_years?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourly_rate?: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  available: boolean;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  location_radius?: number;

  @ApiProperty({ required: false, type: 'object' })
  @IsOptional()
  contact_info?: Record<string, any>;

  @ApiProperty()
  created_at: Date;
}