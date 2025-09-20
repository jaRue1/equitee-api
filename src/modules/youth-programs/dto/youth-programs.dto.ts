import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { YouthProgram } from '../../../entities/youth-program.entity';

export class LocationDto {
  @ApiProperty({ example: 25.7617 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -80.1918 })
  @IsNumber()
  lng: number;
}

export class FindProgramsRequest {
  @ApiProperty({
    description: 'User location coordinates',
    type: LocationDto
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({
    required: false,
    type: [Number],
    example: [8, 14],
    description: 'Age range [min, max]'
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  ageRange?: number[];

  @ApiProperty({ required: false, example: 50 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({ required: false, example: 25 })
  @IsOptional()
  @IsNumber()
  radius?: number;

  @ApiProperty({ required: false, example: 'First Tee' })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  equipmentProvided?: boolean;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  transportationAvailable?: boolean;
}

export class EnrollmentRequest {
  @ApiProperty()
  @IsString()
  parentName: string;

  @ApiProperty()
  @IsString()
  parentEmail: string;

  @ApiProperty()
  @IsString()
  parentPhone: string;

  @ApiProperty()
  @IsString()
  childName: string;

  @ApiProperty()
  @IsNumber()
  childAge: number;

  @ApiProperty()
  @IsString()
  emergencyContact: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  medicalInfo?: string;
}

export class YouthProgramWithDistanceDto extends YouthProgram {
  @ApiProperty({ required: false })
  distance_miles?: number;

  @ApiProperty({ required: false })
  age_range?: string;
}