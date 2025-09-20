import { Controller, Get, Post, Param, Body, Query, ParseFloatPipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { YouthProgramsService } from './youth-programs.service';
import { YouthProgramWithDistanceDto, FindProgramsRequest, EnrollmentRequest } from './dto/youth-programs.dto';

@ApiTags('youth-programs')
@Controller('youth-programs')
export class YouthProgramsController {
  constructor(private youthProgramsService: YouthProgramsService) {}

  @Post('search')
  @ApiOperation({
    summary: 'Find youth golf programs based on location and preferences',
    description: 'Search for youth golf programs based on location, age range, budget, and other criteria'
  })
  @ApiBody({
    description: 'Search criteria for finding youth programs',
    type: FindProgramsRequest
  })
  @ApiResponse({
    status: 200,
    description: 'List of youth programs matching search criteria',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          organization: { type: 'string' },
          address: { type: 'string' },
          age_range: { type: 'string', example: '5-17 years' },
          cost_per_session: { type: 'number' },
          schedule_days: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          equipment_provided: { type: 'boolean' },
          transportation_available: { type: 'boolean' },
          contact_info: { type: 'object' },
          distance_miles: { type: 'number' }
        }
      }
    }
  })
  async findPrograms(@Body() request: FindProgramsRequest): Promise<YouthProgramWithDistanceDto[]> {
    return await this.youthProgramsService.findNearbyPrograms(request);
  }

  @Get('nearby')
  @ApiOperation({
    summary: 'Find youth programs near specific coordinates',
    description: 'Get youth programs within a specified radius of lat/lng coordinates'
  })
  @ApiQuery({ name: 'lat', description: 'Latitude', example: 25.7617 })
  @ApiQuery({ name: 'lng', description: 'Longitude', example: -80.1918 })
  @ApiQuery({ name: 'radius', description: 'Search radius in miles', example: 25, required: false })
  @ApiQuery({ name: 'budget', description: 'Maximum cost per session', example: 50, required: false })
  @ApiQuery({ name: 'minAge', description: 'Minimum age', example: 8, required: false })
  @ApiQuery({ name: 'maxAge', description: 'Maximum age', example: 16, required: false })
  async findNearbyPrograms(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query('radius', new ParseIntPipe({ optional: true })) radius = 25,
    @Query('budget', new ParseIntPipe({ optional: true })) budget = 100,
    @Query('minAge', new ParseIntPipe({ optional: true })) minAge = 5,
    @Query('maxAge', new ParseIntPipe({ optional: true })) maxAge = 17,
  ): Promise<YouthProgramWithDistanceDto[]> {
    return await this.youthProgramsService.findNearbyPrograms({
      location: { lat, lng },
      radius,
      budget,
      ageRange: [minAge, maxAge],
    });
  }

  @Get('free')
  @ApiOperation({
    summary: 'Get all free youth programs',
    description: 'Returns all youth programs that are completely free'
  })
  @ApiResponse({
    status: 200,
    description: 'List of free youth programs',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/YouthProgram' }
    }
  })
  async getFreePrograms() {
    return await this.youthProgramsService.getFreePrograms();
  }

  @Get('with-equipment')
  @ApiOperation({
    summary: 'Get programs that provide equipment',
    description: 'Returns all youth programs that provide golf equipment'
  })
  @ApiResponse({
    status: 200,
    description: 'List of programs providing equipment'
  })
  async getProgramsWithEquipment() {
    return await this.youthProgramsService.getProgramsWithEquipment();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get youth program statistics',
    description: 'Returns statistics about available youth programs'
  })
  @ApiResponse({
    status: 200,
    description: 'Youth program statistics',
    schema: {
      type: 'object',
      properties: {
        totalPrograms: { type: 'number', example: 6 },
        freePrograms: { type: 'number', example: 2 },
        averageCost: { type: 'number', example: 28 },
        organizations: { type: 'array', items: { type: 'string' } },
        ageRanges: {
          type: 'object',
          properties: {
            min: { type: 'number', example: 5 },
            max: { type: 'number', example: 17 }
          }
        },
        providingEquipment: { type: 'number', example: 4 },
        providingTransportation: { type: 'number', example: 0 }
      }
    }
  })
  async getProgramStats() {
    return await this.youthProgramsService.getProgramStats();
  }

  @Get('organization/:organization')
  @ApiOperation({
    summary: 'Find programs by organization',
    description: 'Get all programs from a specific organization (e.g., First Tee, PGA)'
  })
  @ApiParam({ name: 'organization', description: 'Organization name', example: 'First Tee' })
  async getProgramsByOrganization(@Param('organization') organization: string) {
    return await this.youthProgramsService.getProgramsByOrganization(organization);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get youth program by ID',
    description: 'Returns detailed information about a specific youth program'
  })
  @ApiParam({ name: 'id', description: 'Program UUID' })
  @ApiResponse({
    status: 200,
    description: 'Youth program details'
  })
  @ApiResponse({
    status: 404,
    description: 'Program not found'
  })
  async getProgramById(@Param('id') id: string) {
    const program = await this.youthProgramsService.getProgramById(id);
    if (!program) {
      throw new Error('Youth program not found');
    }
    return program;
  }

  @Post(':id/enroll')
  @ApiOperation({
    summary: 'Enroll in a youth program',
    description: 'Submit enrollment application for a specific youth program'
  })
  @ApiParam({ name: 'id', description: 'Program UUID' })
  @ApiBody({
    description: 'Enrollment application details',
    schema: {
      type: 'object',
      properties: {
        parentName: { type: 'string', example: 'John Smith' },
        parentEmail: { type: 'string', example: 'john.smith@email.com' },
        parentPhone: { type: 'string', example: '(305) 555-0123' },
        childName: { type: 'string', example: 'Emma Smith' },
        childAge: { type: 'number', example: 12 },
        emergencyContact: { type: 'string', example: 'Jane Smith (305) 555-0124' },
        medicalInfo: { type: 'string', example: 'No known allergies or medical conditions' }
      },
      required: ['parentName', 'parentEmail', 'parentPhone', 'childName', 'childAge', 'emergencyContact']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment request submitted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Enrollment request submitted. You will receive confirmation within 24 hours.' },
        enrollmentId: { type: 'string', example: 'enroll_1234567890' }
      }
    }
  })
  async enrollInProgram(
    @Param('id') programId: string,
    @Body() request: EnrollmentRequest,
  ) {
    return await this.youthProgramsService.enrollInProgram(programId, request);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all youth programs',
    description: 'Returns all available youth programs ordered by cost'
  })
  @ApiResponse({
    status: 200,
    description: 'List of all youth programs'
  })
  async getAllPrograms() {
    return await this.youthProgramsService.getAllPrograms();
  }
}