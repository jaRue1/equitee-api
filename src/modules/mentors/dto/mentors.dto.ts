import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Mentor } from '../../../entities/mentor.entity';

export class LocationDto {
  @ApiProperty({ example: 25.7617 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -80.1918 })
  @IsNumber()
  lng: number;
}

export class FindMentorsRequest {
  @ApiProperty({
    description: 'User location coordinates',
    type: LocationDto
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ required: false, example: 'beginner' })
  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({ required: false, example: 25 })
  @IsOptional()
  @IsNumber()
  radius?: number;

  @ApiProperty({
    required: false,
    type: [String],
    example: ['juniors', 'fundamentals']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];
}

export class ContactMentorRequest {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: ['email', 'phone'] })
  @IsString()
  preferredContact: string;
}

export class MentorWithUserDto extends Mentor {
  @ApiProperty()
  user: {
    name: string;
    email: string;
    location_lat: number;
    location_lng: number;
  };

  @ApiProperty({ required: false })
  distance_miles?: number;
}