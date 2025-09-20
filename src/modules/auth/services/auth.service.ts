import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { User, UserType } from '../../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ user: User; access_token: string; message: string }> {
    // Find or create user based on email from frontend Google OAuth
    let user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      // User doesn't exist, create a new one with basic info from Google
      user = await this.usersService.create({
        email: loginDto.email,
        name: loginDto.name,
        user_type: UserType.YOUTH, // Default, can be updated later
      });
    }

    // Generate JWT token
    const payload = {
      email: user.email,
      sub: user.id,
      userType: user.user_type,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user,
      access_token,
      message: 'Login successful'
    };
  }

  async register(registerDto: RegisterDto): Promise<{ user: User; access_token: string; message: string }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      // User exists, generate token and return
      const payload = {
        email: existingUser.email,
        sub: existingUser.id,
        userType: existingUser.user_type,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        user: existingUser,
        access_token,
        message: 'User already exists'
      };
    }

    // Create new user
    const user = await this.usersService.create(registerDto);

    // Generate JWT token
    const payload = {
      email: user.email,
      sub: user.id,
      userType: user.user_type,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user,
      access_token,
      message: 'Registration completed successfully'
    };
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }
}