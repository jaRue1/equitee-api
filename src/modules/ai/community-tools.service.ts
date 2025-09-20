import { Injectable } from '@nestjs/common';

interface TravelOption {
  mode: string;
  duration: number;
  distance: number;
  cost?: number;
  description: string;
}

@Injectable()
export class CommunityToolsService {

  async calculateTravelOptions(params: {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    transportModes?: string[];
  }): Promise<TravelOption[]> {

    const options: TravelOption[] = [];
    const transportModes = params.transportModes || ['driving', 'transit', 'walking'];

    // Calculate driving distance and time
    if (transportModes.includes('driving')) {
      const drivingOption = await this.calculateDrivingRoute(params.from, params.to);
      options.push(drivingOption);
    }

    // Calculate public transit options
    if (transportModes.includes('transit')) {
      const transitOption = await this.calculateTransitRoute(params.from, params.to);
      options.push(transitOption);
    }

    // Calculate walking/biking if distance is reasonable
    const distance = this.calculateDistance(params.from, params.to);
    if (distance <= 5 && transportModes.includes('walking')) {
      const walkingOption = await this.calculateWalkingRoute(params.from, params.to);
      options.push(walkingOption);
    }

    if (distance <= 15 && transportModes.includes('biking')) {
      const bikingOption = await this.calculateBikingRoute(params.from, params.to);
      options.push(bikingOption);
    }

    return options;
  }

  private async calculateDrivingRoute(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<TravelOption> {
    const distance = this.calculateDistance(from, to);

    // Simple estimation - in a real implementation, would use Google Maps/Mapbox routing
    const duration = Math.round(distance / 30 * 60); // Assume 30 mph average
    const cost = distance * 0.56; // IRS mileage rate

    return {
      mode: 'driving',
      duration,
      distance: Math.round(distance * 10) / 10,
      cost: Math.round(cost * 100) / 100,
      description: `${duration} min drive (${Math.round(distance)} miles) • ~$${Math.round(cost)} in gas`
    };
  }

  private async calculateTransitRoute(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<TravelOption> {
    const distance = this.calculateDistance(from, to);

    // Simple estimation - would use transit API in real implementation
    const duration = Math.round(distance / 15 * 60); // Assume 15 mph average with stops
    const cost = 5.50; // Average South Florida transit fare

    return {
      mode: 'transit',
      duration,
      distance: Math.round(distance * 10) / 10,
      cost,
      description: `${duration} min by public transit • $${cost} fare`
    };
  }

  private async calculateWalkingRoute(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<TravelOption> {
    const distance = this.calculateDistance(from, to);

    const duration = Math.round(distance / 3 * 60); // Assume 3 mph walking speed

    return {
      mode: 'walking',
      duration,
      distance: Math.round(distance * 10) / 10,
      description: `${duration} min walk (${Math.round(distance)} miles)`
    };
  }

  private async calculateBikingRoute(from: { lat: number; lng: number }, to: { lat: number; lng: number }): Promise<TravelOption> {
    const distance = this.calculateDistance(from, to);

    const duration = Math.round(distance / 12 * 60); // Assume 12 mph biking speed

    return {
      mode: 'biking',
      duration,
      distance: Math.round(distance * 10) / 10,
      description: `${duration} min bike ride (${Math.round(distance)} miles)`
    };
  }

  calculateDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    // Haversine formula for distance calculation
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(to.lat - from.lat);
    const dLng = this.toRadians(to.lng - from.lng);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(from.lat)) * Math.cos(this.toRadians(to.lat)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  async getLocationContext(lat: number, lng: number): Promise<{
    area: string;
    county: string;
    nearbyLandmarks: string[];
    golfAccessibility: string;
  }> {
    // Determine South Florida area based on coordinates
    let area = 'South Florida';
    let county = 'Unknown';

    if (lat >= 25.0 && lat <= 26.0 && lng >= -80.5 && lng <= -80.0) {
      area = 'Miami-Dade';
      county = 'Miami-Dade';
    } else if (lat >= 26.0 && lat <= 26.9 && lng >= -80.3 && lng <= -80.0) {
      area = 'Broward County';
      county = 'Broward';
    } else if (lat >= 26.3 && lat <= 27.0 && lng >= -80.2 && lng <= -79.8) {
      area = 'Palm Beach County';
      county = 'Palm Beach';
    }

    const nearbyLandmarks = this.getNearbyLandmarks(lat, lng);
    const golfAccessibility = this.assessGolfAccessibility(area);

    return {
      area,
      county,
      nearbyLandmarks,
      golfAccessibility,
    };
  }

  private getNearbyLandmarks(lat: number, lng: number): string[] {
    // Simple landmark detection based on coordinates
    const landmarks = [];

    // Miami area landmarks
    if (lat >= 25.7 && lat <= 25.8 && lng >= -80.3 && lng <= -80.1) {
      landmarks.push('Miami Beach', 'Downtown Miami', 'Biscayne Bay');
    }

    // Fort Lauderdale area
    if (lat >= 26.0 && lat <= 26.2 && lng >= -80.2 && lng <= -80.0) {
      landmarks.push('Fort Lauderdale Beach', 'Las Olas Boulevard');
    }

    // Palm Beach area
    if (lat >= 26.6 && lat <= 26.8 && lng >= -80.1 && lng <= -79.9) {
      landmarks.push('Palm Beach', 'Worth Avenue', 'Intracoastal Waterway');
    }

    return landmarks.length > 0 ? landmarks : ['South Florida Coast'];
  }

  private assessGolfAccessibility(area: string): string {
    switch (area) {
      case 'Miami-Dade':
        return 'High accessibility with multiple municipal courses and youth programs';
      case 'Broward County':
        return 'Good accessibility with mix of public and private options';
      case 'Palm Beach County':
        return 'Excellent accessibility with numerous high-quality courses';
      default:
        return 'Moderate accessibility typical for South Florida';
    }
  }
}