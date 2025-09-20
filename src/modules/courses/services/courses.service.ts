import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { SearchCoursesDto } from '../dto/search-courses.dto';
import { Course } from '../../../entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const { data, error } = await this.supabaseService
      .from('courses')
      .insert(createCourseDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create course: ${error.message}`);
    }

    return data;
  }

  async findAll(searchDto?: SearchCoursesDto): Promise<Course[]> {
    let query = this.supabaseService
      .from('courses')
      .select('*');

    if (searchDto) {
      // Filter by youth programs
      if (searchDto.youth_programs !== undefined) {
        query = query.eq('youth_programs', searchDto.youth_programs);
      }

      // Filter by equipment rental
      if (searchDto.equipment_rental !== undefined) {
        query = query.eq('equipment_rental', searchDto.equipment_rental);
      }

      // Filter by maximum price
      if (searchDto.price !== undefined) {
        query = query.or(`green_fee_max.lte.${searchDto.price},green_fee_max.is.null`);
      }

      // Filter by maximum difficulty
      if (searchDto.max_difficulty !== undefined) {
        query = query.or(`difficulty_rating.lte.${searchDto.max_difficulty},difficulty_rating.is.null`);
      }

      // TODO: Implement distance-based filtering using PostGIS or custom logic
      // For now, we'll return all results and can add distance calculation later
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string): Promise<Course> {
    const { data, error } = await this.supabaseService
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return data;
  }

  async search(searchDto: SearchCoursesDto): Promise<Course[]> {
    return this.findAll(searchDto);
  }

  async update(id: string, updateCourseDto: Partial<CreateCourseDto>): Promise<Course> {
    const { data, error } = await this.supabaseService
      .from('courses')
      .update(updateCourseDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

}