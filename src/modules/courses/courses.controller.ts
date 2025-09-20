import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './services/courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { SearchCoursesDto } from './dto/search-courses.dto';
import { Course } from '../../entities/course.entity';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully', type: Course })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get courses with optional filters' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully', type: [Course] })
  @ApiQuery({ name: 'lat', required: false, description: 'Latitude for location search' })
  @ApiQuery({ name: 'lng', required: false, description: 'Longitude for location search' })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in miles' })
  @ApiQuery({ name: 'price', required: false, description: 'Maximum green fee price' })
  @ApiQuery({ name: 'youth_programs', required: false, description: 'Filter by youth programs' })
  @ApiQuery({ name: 'equipment_rental', required: false, description: 'Filter by equipment rental' })
  @ApiQuery({ name: 'max_difficulty', required: false, description: 'Maximum difficulty rating' })
  findAll(@Query() searchDto: SearchCoursesDto) {
    return this.coursesService.findAll(searchDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed course information' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Post('search')
  @ApiOperation({ summary: 'Advanced search with multiple filters' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully', type: [Course] })
  search(@Body() searchDto: SearchCoursesDto) {
    return this.coursesService.search(searchDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course information' })
  @ApiResponse({ status: 200, description: 'Course updated successfully', type: Course })
  @ApiResponse({ status: 404, description: 'Course not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: Partial<CreateCourseDto>,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.remove(id);
  }
}