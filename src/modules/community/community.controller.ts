import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CommunityService } from './community.service';
import {
  CreateGolfGroupRequest,
  CreatePartnerRequestRequest,
  FindPlayingPartnersRequest,
  JoinGolfGroupRequest,
  GolfGroupWithDetails,
  PartnerRequestWithDetails,
  PlayingPartnersResponse,
} from './dto/community.dto';

@ApiTags('community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('golf-groups')
  @ApiOperation({
    summary: 'Create a new golf group',
    description: 'Create a golf group for a specific course, date, and time'
  })
  @ApiBody({
    description: 'Golf group creation details',
    schema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course UUID' },
        createdBy: { type: 'string', description: 'Creator user UUID' },
        scheduledDate: { type: 'string', format: 'date', example: '2024-03-15' },
        scheduledTime: { type: 'string', example: '10:00' },
        maxPlayers: { type: 'number', minimum: 2, maximum: 6, default: 4 },
        skillLevel: { type: 'string', example: 'intermediate' },
        description: { type: 'string', example: 'Casual round for intermediate players' }
      },
      required: ['courseId', 'createdBy', 'scheduledDate', 'scheduledTime']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Golf group created successfully',
    type: GolfGroupWithDetails
  })
  async createGolfGroup(@Body() request: CreateGolfGroupRequest): Promise<GolfGroupWithDetails> {
    return await this.communityService.createGolfGroup(request);
  }

  @Post('golf-groups/:groupId/join')
  @ApiOperation({
    summary: 'Join a golf group',
    description: 'Join an existing golf group if there are available spots'
  })
  @ApiParam({ name: 'groupId', description: 'Golf group UUID' })
  @ApiBody({
    description: 'Join request details',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User UUID' },
        message: { type: 'string', description: 'Optional message to the group' }
      },
      required: ['userId']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Join request processed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async joinGolfGroup(
    @Param('groupId') groupId: string,
    @Body() request: JoinGolfGroupRequest,
  ) {
    return await this.communityService.joinGolfGroup(groupId, request.userId);
  }

  @Delete('golf-groups/:groupId/leave')
  @ApiOperation({
    summary: 'Leave a golf group',
    description: 'Remove yourself from a golf group'
  })
  @ApiParam({ name: 'groupId', description: 'Golf group UUID' })
  @ApiQuery({ name: 'userId', description: 'User UUID' })
  async leaveGolfGroup(
    @Param('groupId') groupId: string,
    @Query('userId') userId: string,
  ) {
    return await this.communityService.leaveGolfGroup(groupId, userId);
  }

  @Post('partner-requests')
  @ApiOperation({
    summary: 'Create a partner request',
    description: 'Create a request to find golf playing partners for a specific course'
  })
  @ApiBody({
    description: 'Partner request details',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User UUID' },
        courseId: { type: 'string', description: 'Course UUID' },
        preferredDate: { type: 'string', format: 'date', example: '2024-03-15' },
        preferredTime: { type: 'string', example: '14:00' },
        skillLevel: { type: 'string', example: 'beginner' },
        message: { type: 'string', example: 'Looking for friendly players for weekend round' }
      },
      required: ['userId', 'courseId']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Partner request created successfully',
    type: PartnerRequestWithDetails
  })
  async createPartnerRequest(@Body() request: CreatePartnerRequestRequest): Promise<PartnerRequestWithDetails> {
    return await this.communityService.createPartnerRequest(request);
  }

  @Delete('partner-requests/:requestId')
  @ApiOperation({
    summary: 'Cancel a partner request',
    description: 'Cancel an existing partner request'
  })
  @ApiParam({ name: 'requestId', description: 'Partner request UUID' })
  @ApiQuery({ name: 'userId', description: 'User UUID' })
  async cancelPartnerRequest(
    @Param('requestId') requestId: string,
    @Query('userId') userId: string,
  ) {
    return await this.communityService.cancelPartnerRequest(requestId, userId);
  }

  @Post('playing-partners')
  @ApiOperation({
    summary: 'Find playing partners',
    description: 'Find available golf groups and partner requests for a specific course and date'
  })
  @ApiBody({
    description: 'Search criteria for playing partners',
    schema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course UUID' },
        date: { type: 'string', format: 'date', example: '2024-03-15' },
        skillLevel: { type: 'string', example: 'intermediate' },
        maxDistance: { type: 'number', example: 25 }
      },
      required: ['courseId', 'date']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Playing partners found',
    type: PlayingPartnersResponse
  })
  async findPlayingPartners(@Body() request: FindPlayingPartnersRequest): Promise<PlayingPartnersResponse> {
    return await this.communityService.findPlayingPartners(request);
  }

  @Get('golf-groups/:groupId')
  @ApiOperation({
    summary: 'Get golf group details',
    description: 'Get detailed information about a specific golf group including members'
  })
  @ApiParam({ name: 'groupId', description: 'Golf group UUID' })
  @ApiResponse({
    status: 200,
    description: 'Golf group details',
    type: GolfGroupWithDetails
  })
  @ApiResponse({
    status: 404,
    description: 'Golf group not found'
  })
  async getGolfGroupById(@Param('groupId') groupId: string): Promise<GolfGroupWithDetails> {
    const group = await this.communityService.getGolfGroupById(groupId);
    if (!group) {
      throw new Error('Golf group not found');
    }
    return group;
  }

  @Get('users/:userId/golf-groups')
  @ApiOperation({
    summary: 'Get user\'s golf groups',
    description: 'Get all golf groups that a user is a member of'
  })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'User\'s golf groups',
    type: [GolfGroupWithDetails]
  })
  async getUserGolfGroups(@Param('userId') userId: string): Promise<GolfGroupWithDetails[]> {
    return await this.communityService.getUserGolfGroups(userId);
  }

  @Get('users/:userId/partner-requests')
  @ApiOperation({
    summary: 'Get user\'s partner requests',
    description: 'Get all partner requests created by a user'
  })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({
    status: 200,
    description: 'User\'s partner requests',
    type: [PartnerRequestWithDetails]
  })
  async getUserPartnerRequests(@Param('userId') userId: string): Promise<PartnerRequestWithDetails[]> {
    return await this.communityService.getUserPartnerRequests(userId);
  }
}