import { Controller, Get, Param, ParseFloatPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DemographicsService } from './demographics.service';
import { HeatmapDataDto, AccessibilityScoreDto } from './dto/demographics.dto';

@ApiTags('demographics')
@Controller('demographics')
export class DemographicsController {
  constructor(private demographicsService: DemographicsService) {}

  @Get('heatmap')
  @ApiOperation({
    summary: 'Get demographic heatmap data',
    description: 'Returns all ZIP codes with income data for map visualization including accessibility scores'
  })
  @ApiResponse({
    status: 200,
    description: 'Array of demographic data with accessibility scores',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          zipCode: { type: 'string', example: '33156' },
          medianIncome: { type: 'number', example: 75000 },
          population: { type: 'number', example: 45000 },
          county: { type: 'string', example: 'Miami-Dade' },
          accessibilityScore: { type: 'number', example: 72.5 }
        }
      }
    }
  })
  async getHeatmapData(): Promise<HeatmapDataDto[]> {
    return await this.demographicsService.getHeatmapData();
  }

  @Get('accessibility-score/:lat/:lng')
  @ApiOperation({
    summary: 'Calculate accessibility score for specific location',
    description: 'Returns accessibility score based on local median income, distance to affordable courses, and transportation options'
  })
  @ApiParam({ name: 'lat', description: 'Latitude coordinate', example: 25.7617 })
  @ApiParam({ name: 'lng', description: 'Longitude coordinate', example: -80.1918 })
  @ApiResponse({
    status: 200,
    description: 'Accessibility analysis for the location',
    schema: {
      type: 'object',
      properties: {
        accessibilityScore: { type: 'number', example: 72.5 },
        nearestAffordableCourse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Miami Beach Golf Club' },
            address: { type: 'string' },
            distance: { type: 'number', example: 3.2 },
            greenFeeRange: {
              type: 'object',
              properties: {
                min: { type: 'number', example: 45 },
                max: { type: 'number', example: 85 }
              }
            },
            youthPrograms: { type: 'boolean', example: true },
            equipmentRental: { type: 'boolean', example: true }
          }
        },
        estimatedAnnualCost: { type: 'number', example: 2860 },
        transportationOptions: {
          type: 'array',
          items: { type: 'string' },
          example: ['driving', 'rideshare', 'public_transit']
        }
      }
    }
  })
  async getAccessibilityScore(
    @Param('lat', ParseFloatPipe) lat: number,
    @Param('lng', ParseFloatPipe) lng: number,
  ): Promise<AccessibilityScoreDto> {
    return await this.demographicsService.getAccessibilityScore(lat, lng);
  }

  @Get('zip/:zipCode')
  @ApiOperation({
    summary: 'Get demographic data for specific ZIP code',
    description: 'Returns median income, population, and county data for a specific ZIP code'
  })
  @ApiParam({ name: 'zipCode', description: '5-digit ZIP code', example: '33156' })
  @ApiResponse({
    status: 200,
    description: 'Demographic data for the ZIP code'
  })
  async getDemographicsByZip(@Param('zipCode') zipCode: string) {
    return await this.demographicsService.getDemographicsByZip(zipCode);
  }
}