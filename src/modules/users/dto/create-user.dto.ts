import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsNumber, IsInt, Min, Max } from 'class-validator';
import { UserType, GolfExperience } from '../../../entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType)
  user_type: UserType;

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
  zip_code?: string;

  @ApiProperty({ enum: GolfExperience, required: false })
  @IsOptional()
  @IsEnum(GolfExperience)
  golf_experience?: GolfExperience;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  handicap?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;
}