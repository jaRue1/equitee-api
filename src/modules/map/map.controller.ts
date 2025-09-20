import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MapService } from './map.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @Get('config')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get map configuration (rate-limited, secure token delivery)',
    description: 'Returns Mapbox configuration. Rate limited to 10 requests per minute to prevent token abuse. Requires authentication.'
  })
  @ApiResponse({
    status: 200,
    description: 'Map configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: 'Mapbox access token' },
        style: { type: 'string', description: 'Default map style' },
        center: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' }
          },
          description: 'Default map center (Miami)'
        },
        zoom: { type: 'number', description: 'Default zoom level' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required'
  })
  getMapConfig() {
    return this.mapService.getMapConfig();
  }
}