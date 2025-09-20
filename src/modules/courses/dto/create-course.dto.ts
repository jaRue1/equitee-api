import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl, Min, Max } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  green_fee_min?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  green_fee_max?: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  youth_programs: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  difficulty_rating?: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  equipment_rental: boolean;

  @ApiProperty({ required: false, type: 'object' })
  @IsOptional()
  contact_info?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  website?: string;
}