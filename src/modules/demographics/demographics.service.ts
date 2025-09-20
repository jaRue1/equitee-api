import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { Demographics } from '../../entities/demographics.entity';
import { HeatmapDataDto, AccessibilityScoreDto } from './dto/demographics.dto';

@Injectable()
export class DemographicsService {
  constructor(private supabaseService: SupabaseService) {}

  async getDemographicsByZip(zipCode: string): Promise<Demographics | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('demographics')
      .select('*')
      .eq('zip_code', zipCode)
      .single();

    if (error) {
      throw new Error(`Failed to get demographics for ZIP ${zipCode}: ${error.message}`);
    }

    return data;
  }

  async getHeatmapData(): Promise<HeatmapDataDto[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('demographics')
      .select(`
        zip_code,
        median_income,
        population,
        county
      `)
      .order('zip_code');

    if (error) {
      throw new Error(`Failed to get heatmap data: ${error.message}`);
    }

    // For now, return basic demographic data
    // TODO: Add precomputed accessibility scores from accessibility_scores table
    return data.map(item => ({
      zipCode: item.zip_code,
      medianIncome: item.median_income,
      population: item.population || 0,
      county: item.county || '',
    }));
  }

  async getAccessibilityScore(lat: number, lng: number): Promise<AccessibilityScoreDto> {
    // First, find the nearest ZIP code to this location
    const nearestZip = await this.findNearestZipCode(lat, lng);

    if (!nearestZip) {
      throw new Error('No demographic data available for this location');
    }

    // Get demographic data for this ZIP
    const demographics = await this.getDemographicsByZip(nearestZip);

    if (!demographics) {
      throw new Error('No demographic data available for this ZIP code');
    }

    // Find nearest affordable courses using spatial function
    const { data: nearestCourses, error } = await this.supabaseService
      .getClient()
      .rpc('find_courses_nearby', {
        user_lat: lat,
        user_lng: lng,
        max_distance: 25,
        max_green_fee: 100, // Define "affordable" as <= $100
        youth_programs_only: false
      });

    if (error) {
      throw new Error(`Failed to find nearby courses: ${error.message}`);
    }

    const nearestCourse = nearestCourses?.[0];

    if (!nearestCourse) {
      return {
        accessibilityScore: 0,
        nearestAffordableCourse: null,
        estimatedAnnualCost: 0,
        transportationOptions: [],
      };
    }

    // Calculate basic accessibility score
    const accessibilityScore = this.calculateAccessibilityScore({
      localMedianIncome: demographics.median_income,
      nearestAffordableCourse: {
        distance: nearestCourse.distance_miles,
        greenFee: (nearestCourse.green_fee_min + nearestCourse.green_fee_max) / 2,
        youthPrograms: nearestCourse.youth_programs,
      },
      transportationScore: 5, // Default mid-range score
    });

    return {
      accessibilityScore,
      nearestAffordableCourse: {
        id: nearestCourse.id,
        name: nearestCourse.name,
        address: nearestCourse.address,
        distance: nearestCourse.distance_miles,
        greenFeeRange: {
          min: nearestCourse.green_fee_min,
          max: nearestCourse.green_fee_max,
        },
        youthPrograms: nearestCourse.youth_programs,
        equipmentRental: nearestCourse.equipment_rental,
      },
      estimatedAnnualCost: this.calculateAnnualCost(
        (nearestCourse.green_fee_min + nearestCourse.green_fee_max) / 2
      ),
      transportationOptions: this.getTransportationOptions(nearestCourse.distance_miles),
    };
  }

  private async findNearestZipCode(lat: number, lng: number): Promise<string | null> {
    // Simple approach: find demographic record with closest lat/lng
    // For production, would use actual ZIP code boundary data
    const { data, error } = await this.supabaseService
      .getClient()
      .from('demographics')
      .select('zip_code')
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    // For now, return a South Florida ZIP based on lat/lng ranges
    if (lat >= 25.0 && lat <= 26.8 && lng >= -80.5 && lng <= -80.0) {
      // Miami-Dade area
      return '33156'; // Sample ZIP with good coverage
    } else if (lat >= 26.0 && lat <= 26.9 && lng >= -80.3 && lng <= -80.0) {
      // Broward area
      return '33324'; // Sample ZIP
    } else if (lat >= 26.3 && lat <= 27.0 && lng >= -80.2 && lng <= -79.8) {
      // Palm Beach area
      return '33414'; // Sample ZIP
    }

    return '33156'; // Default to Miami area
  }

  private calculateAccessibilityScore(factors: {
    localMedianIncome: number;
    nearestAffordableCourse: {
      distance: number;
      greenFee: number;
      youthPrograms: boolean;
    };
    transportationScore: number;
  }): number {
    const { localMedianIncome, nearestAffordableCourse, transportationScore } = factors;

    // Calculate affordability ratio (higher is better)
    const annualGolfCost = nearestAffordableCourse.greenFee * 24; // 24 rounds per year
    const affordabilityRatio = localMedianIncome / annualGolfCost;

    // Distance penalty (closer is better)
    const distancePenalty = Math.max(0.1, 1 - (nearestAffordableCourse.distance / 30));

    // Transportation bonus
    const transportBonus = transportationScore / 10;

    // Youth program bonus
    const youthProgramBonus = nearestAffordableCourse.youthPrograms ? 1.2 : 1.0;

    // Combine factors and normalize to 0-100 scale
    const rawScore = affordabilityRatio * distancePenalty * transportBonus * youthProgramBonus;
    return Math.min(100, Math.max(0, rawScore * 5)); // Scale to 0-100
  }

  private calculateAnnualCost(averageGreenFee: number): number {
    // Estimate for moderate golfer (24 rounds per year)
    const roundsPerYear = 24;
    const equipmentCost = 500; // Annual equipment/maintenance
    const lessonsCost = 800; // Occasional lessons

    return (averageGreenFee * roundsPerYear) + equipmentCost + lessonsCost;
  }

  private getTransportationOptions(distance: number): string[] {
    const options: string[] = [];

    if (distance <= 3) {
      options.push('walking', 'biking', 'rideshare', 'driving');
    } else if (distance <= 10) {
      options.push('biking', 'rideshare', 'driving', 'public_transit');
    } else if (distance <= 25) {
      options.push('rideshare', 'driving', 'public_transit');
    } else {
      options.push('driving', 'rideshare');
    }

    return options;
  }
}