import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../../entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with Google OAuth data from frontend' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Complete registration after frontend Google OAuth' })
  @ApiResponse({ status: 201, description: 'Registration completed successfully' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (requires JWT token)' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req) {
    return req.user.user;
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Get user profile by ID (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  getProfileById(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.getProfile(id);
  }
}