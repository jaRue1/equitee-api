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
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EquipmentService } from './services/equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { EquipmentFiltersDto } from './dto/equipment-filters.dto';
import { ClaimEquipmentDto } from './dto/claim-equipment.dto';
import { Equipment } from '../../entities/equipment.entity';

@ApiTags('equipment')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new equipment listing' })
  @ApiResponse({ status: 201, description: 'Equipment created successfully', type: Equipment })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get equipment listings with filters' })
  @ApiResponse({ status: 200, description: 'Equipment listings retrieved successfully', type: [Equipment] })
  @ApiQuery({ name: 'equipment_type', required: false, description: 'Filter by equipment type' })
  @ApiQuery({ name: 'condition', required: false, description: 'Filter by condition' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'max_price', required: false, description: 'Maximum price' })
  @ApiQuery({ name: 'min_price', required: false, description: 'Minimum price' })
  @ApiQuery({ name: 'lat', required: false, description: 'Latitude for location search' })
  @ApiQuery({ name: 'lng', required: false, description: 'Longitude for location search' })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in miles' })
  findAll(@Query() filters: EquipmentFiltersDto) {
    return this.equipmentService.findAll(filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized equipment recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully', type: [Equipment] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'user_id', required: true, description: 'User ID for personalized recommendations' })
  getRecommendations(@Query('user_id', ParseUUIDPipe) userId: string) {
    return this.equipmentService.getRecommendations(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get equipment listings by user' })
  @ApiResponse({ status: 200, description: 'User equipment retrieved successfully', type: [Equipment] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.equipmentService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  @ApiResponse({ status: 200, description: 'Equipment retrieved successfully', type: Equipment })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.equipmentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/claim')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim/purchase equipment' })
  @ApiResponse({ status: 200, description: 'Equipment claimed successfully', type: Equipment })
  @ApiResponse({ status: 400, description: 'Equipment not available for claiming' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  claimEquipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() claimDto: ClaimEquipmentDto,
  ) {
    return this.equipmentService.claimEquipment(id, claimDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update equipment listing' })
  @ApiResponse({ status: 200, description: 'Equipment updated successfully', type: Equipment })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: Partial<CreateEquipmentDto>,
  ) {
    return this.equipmentService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete equipment listing' })
  @ApiResponse({ status: 200, description: 'Equipment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.equipmentService.remove(id);
  }
}