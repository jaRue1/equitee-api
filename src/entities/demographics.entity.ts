import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class Demographics {
  @ApiProperty()
  id: string;

  @ApiProperty()
  @IsString()
  zip_code: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  median_income: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  population?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiProperty()
  created_at: Date;
}