import { Controller, Get, Post, Param, Body, Query, ParseFloatPipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MentorsService } from './mentors.service';
import { MentorWithUserDto, FindMentorsRequest, ContactMentorRequest } from './dto/mentors.dto';

@ApiTags('mentors')
@Controller('mentors')
export class MentorsController {
  constructor(private mentorsService: MentorsService) {}

  @Post('search')
  @ApiOperation({
    summary: 'Find mentors based on location and preferences',
    description: 'Search for golf mentors/coaches based on location, budget, experience level, and specialties'
  })
  @ApiBody({
    description: 'Search criteria for finding mentors',
    type: FindMentorsRequest
  })
  @ApiResponse({
    status: 200,
    description: 'List of mentors matching search criteria',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          bio: { type: 'string' },
          experience_years: { type: 'number' },
          hourly_rate: { type: 'number' },
          specialties: { type: 'array', items: { type: 'string' } },
          certifications: { type: 'array', items: { type: 'string' } },
          contact_info: { type: 'object' },
          distance_miles: { type: 'number' },
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async findMentors(@Body() request: FindMentorsRequest): Promise<MentorWithUserDto[]> {
    return await this.mentorsService.findNearbyMentors(request);
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Find mentors near specific coordinates',
    description: 'Get mentors within a specified radius of lat/lng coordinates'
  })
  @ApiQuery({ name: 'lat', description: 'Latitude', example: 25.7617 })
  @ApiQuery({ name: 'lng', description: 'Longitude', example: -80.1918 })
  @ApiQuery({ name: 'radius', description: 'Search radius in miles', example: 25, required: false })
  @ApiQuery({ name: 'budget', description: 'Maximum hourly rate', example: 100, required: false })
  async findNearbyMentors(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius', new ParseIntPipe({ optional: true })) radius = 25,
    @Query('budget', new ParseIntPipe({ optional: true })) budget = 200,
  ): Promise<MentorWithUserDto[]> {
    return await this.mentorsService.findNearbyMentors({
      location: { lat, lng },
      radius,
      budget,
    });
  }

  @Get('specialties')
  @ApiOperation({
    summary: 'Get available mentor specialties',
    description: 'Returns all available specialties that mentors offer'
  })
  @ApiResponse({
    status: 200,
    description: 'List of available specialties',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['juniors', 'fundamentals', 'putting', 'mental_game', 'tour_coaching']
    }
  })
  async getSpecialties() {
    return await this.mentorsService.getAvailableSpecialties();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get mentor statistics',
    description: 'Returns statistics about available mentors including average rates and experience'
  })
  @ApiResponse({
    status: 200,
    description: 'Mentor statistics',
    schema: {
      type: 'object',
      properties: {
        totalMentors: { type: 'number', example: 13 },
        averageHourlyRate: { type: 'number', example: 95 },
        availableSpecialties: { type: 'array', items: { type: 'string' } },
        experienceRange: {
          type: 'object',
          properties: {
            min: { type: 'number', example: 10 },
            max: { type: 'number', example: 25 }
          }
        }
      }
    }
  })
  async getMentorStats() {
    return await this.mentorsService.getMentorStats();
  }

  @Get('specialty/:specialty')
  @ApiOperation({
    summary: 'Find mentors by specialty',
    description: 'Get all mentors who specialize in a specific area'
  })
  @ApiParam({ name: 'specialty', description: 'Specialty area', example: 'juniors' })
  async getMentorsBySpecialty(@Param('specialty') specialty: string): Promise<MentorWithUserDto[]> {
    return await this.mentorsService.getMentorsBySpecialty(specialty);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get mentor by ID',
    description: 'Returns detailed information about a specific mentor'
  })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiResponse({
    status: 200,
    description: 'Mentor details with user information'
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor not found'
  })
  async getMentorById(@Param('id') id: string): Promise<MentorWithUserDto> {
    const mentor = await this.mentorsService.getMentorById(id);
    if (!mentor) {
      throw new Error('Mentor not found');
    }
    return mentor;
  }

  @Post(':id/contact')
  @ApiOperation({
    summary: 'Contact a mentor',
    description: 'Send a contact request to a specific mentor'
  })
  @ApiParam({ name: 'id', description: 'Mentor UUID' })
  @ApiBody({
    description: 'Contact request details',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'ID of user making contact' },
        message: { type: 'string', description: 'Message to the mentor' },
        preferredContact: { type: 'string', enum: ['email', 'phone'], description: 'Preferred contact method' }
      },
      required: ['userId', 'message', 'preferredContact']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Contact request sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Contact request sent to mentor. They will reach out within 24 hours.' }
      }
    }
  })
  async contactMentor(
    @Param('id') mentorId: string,
    @Body() request: ContactMentorRequest,
  ) {
    return await this.mentorsService.contactMentor(mentorId, request);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all available mentors',
    description: 'Returns all mentors who are currently available'
  })
  @ApiResponse({
    status: 200,
    description: 'List of all available mentors'
  })
  async getAllMentors(): Promise<MentorWithUserDto[]> {
    return await this.mentorsService.getAllMentors();
  }
}