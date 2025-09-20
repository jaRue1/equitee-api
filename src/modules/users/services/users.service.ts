import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { data, error } = await this.supabaseService
      .from('users')
      .insert(createUserDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async findAll(): Promise<User[]> {
    const { data, error } = await this.supabaseService
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string): Promise<User> {
    const { data, error } = await this.supabaseService
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return data;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabaseService
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { data, error } = await this.supabaseService
      .from('users')
      .update(updateUserDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async getRecommendations(userId: string) {
    const user = await this.findOne(userId);

    // Get nearby courses based on user location
    if (user.location_lat && user.location_lng) {
      const { data: courses } = await this.supabaseService
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        courses: courses || [],
        message: 'Recommendations based on your location and experience level'
      };
    }

    return {
      courses: [],
      message: 'Add your location to get personalized course recommendations'
    };
  }
}