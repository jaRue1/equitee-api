import { ApiProperty } from '@nestjs/swagger';

export class HeatmapDataDto {
  @ApiProperty()
  zipCode: string;

  @ApiProperty()
  medianIncome: number;

  @ApiProperty()
  population: number;

  @ApiProperty()
  county: string;

  @ApiProperty({ required: false })
  accessibilityScore?: number;
}

export class AccessibilityScoreDto {
  @ApiProperty()
  accessibilityScore: number;

  @ApiProperty({ required: false })
  nearestAffordableCourse: any;

  @ApiProperty()
  estimatedAnnualCost: number;

  @ApiProperty({ type: [String] })
  transportationOptions: string[];
}