import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchCoursesDto {
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
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  radius?: number = 25;

  @ApiProperty({ required: false, description: 'Maximum green fee price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  price?: number;

  @ApiProperty({ required: false, description: 'Filter by youth programs availability' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  youth_programs?: boolean;

  @ApiProperty({ required: false, description: 'Filter by equipment rental availability' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  equipment_rental?: boolean;

  @ApiProperty({ required: false, description: 'Maximum difficulty rating (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseFloat(value))
  max_difficulty?: number;
}