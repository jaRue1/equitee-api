import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MapService {
  constructor(private readonly configService: ConfigService) {}

  getMapConfig() {
    const accessToken = this.configService.get<string>('MAPBOX_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('Mapbox access token not configured');
    }

    return {
      accessToken,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: {
        lat: 25.7617,
        lng: -80.2911
      },
      zoom: 10,
      pitch: 45,
      bearing: 0
    };
  }
}