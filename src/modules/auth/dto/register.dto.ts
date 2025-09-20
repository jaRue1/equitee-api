import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsEnum } from 'class-validator';
import { UserType } from '../../../entities/user.entity';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType)
  user_type: UserType;
}