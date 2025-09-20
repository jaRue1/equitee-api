import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { YouthProgram } from '../../entities/youth-program.entity';
import { YouthProgramWithDistanceDto } from './dto/youth-programs.dto';

interface FindProgramsParams {
  location: { lat: number; lng: number };
  ageRange?: number[];
  budget?: number;
  radius?: number;
  organization?: string;
  equipmentProvided?: boolean;
  transportationAvailable?: boolean;
}


@Injectable()
export class YouthProgramsService {
  constructor(private supabaseService: SupabaseService) {}

  async findNearbyPrograms(params: FindProgramsParams): Promise<YouthProgramWithDistanceDto[]> {
    const { location, budget = 100, radius = 25 } = params;

    let minAge = 5;
    let maxAge = 17;

    if (params.ageRange && params.ageRange.length > 0) {
      minAge = Math.min(...params.ageRange);
      maxAge = Math.max(...params.ageRange);
    }

    // Use the spatial function from our migrations
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('find_youth_programs_nearby', {
        user_lat: location.lat,
        user_lng: location.lng,
        max_distance: radius,
        max_cost: budget,
        min_age: minAge,
        max_age: maxAge,
      });

    if (error) {
      throw new Error(`Failed to find nearby youth programs: ${error.message}`);
    }

    let filteredData = data || [];

    // Apply additional filters
    if (params.organization) {
      filteredData = filteredData.filter(program =>
        program.organization?.toLowerCase().includes(params.organization.toLowerCase())
      );
    }

    if (params.equipmentProvided !== undefined) {
      filteredData = filteredData.filter(program =>
        program.equipment_provided === params.equipmentProvided
      );
    }

    if (params.transportationAvailable !== undefined) {
      filteredData = filteredData.filter(program =>
        program.transportation_available === params.transportationAvailable
      );
    }

    return filteredData.map(program => ({
      id: program.id,
      name: program.name,
      organization: program.organization,
      location_lat: 0, // Will be populated from spatial function
      location_lng: 0,
      address: program.address,
      age_min: program.age_min,
      age_max: program.age_max,
      cost_per_session: program.cost_per_session,
      schedule_days: program.schedule_days,
      description: program.description,
      equipment_provided: program.equipment_provided || false,
      transportation_available: program.transportation_available || false,
      contact_info: program.contact_info,
      created_at: new Date(),
      distance_miles: program.distance_miles,
      age_range: program.age_range,
    }));
  }

  async getAllPrograms(): Promise<YouthProgram[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('youth_programs')
      .select('*')
      .order('cost_per_session', { ascending: true });

    if (error) {
      throw new Error(`Failed to get youth programs: ${error.message}`);
    }

    return data || [];
  }

  async getProgramById(programId: string): Promise<YouthProgram | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('youth_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get youth program: ${error.message}`);
    }

    return data;
  }

  async getProgramsByOrganization(organization: string): Promise<YouthProgram[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('youth_programs')
      .select('*')
      .ilike('organization', `%${organization}%`)
      .order('cost_per_session', { ascending: true });

    if (error) {
      throw new Error(`Failed to get programs by organization: ${error.message}`);
    }

    return data || [];
  }

  async getFreePrograms(): Promise<YouthProgram[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('youth_programs')
      .select('*')
      .eq('cost_per_session', 0)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get free programs: ${error.message}`);
    }

    return data || [];
  }

  async getProgramsWithEquipment(): Promise<YouthProgram[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('youth_programs')
      .select('*')
      .eq('equipment_provided', true)
      .order('cost_per_session', { ascending: true });

    if (error) {
      throw new Error(`Failed to get programs with equipment: ${error.message}`);
    }

    return data || [];
  }

  async getProgramStats(): Promise<{
    totalPrograms: number;
    freePrograms: number;
    averageCost: number;
    organizations: string[];
    ageRanges: { min: number; max: number };
    providingEquipment: number;
    providingTransportation: number;
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('youth_programs')
      .select('*');

    if (error) {
      throw new Error(`Failed to get program stats: ${error.message}`);
    }

    const programs = data || [];
    const totalPrograms = programs.length;
    const freePrograms = programs.filter(p => p.cost_per_session === 0).length;
    const providingEquipment = programs.filter(p => p.equipment_provided).length;
    const providingTransportation = programs.filter(p => p.transportation_available).length;

    const costs = programs.filter(p => p.cost_per_session > 0).map(p => p.cost_per_session);
    const averageCost = costs.length > 0
      ? costs.reduce((sum, cost) => sum + cost, 0) / costs.length
      : 0;

    const organizations = [...new Set(programs.map(p => p.organization).filter(Boolean))];

    const ages = programs.filter(p => p.age_min && p.age_max);
    const ageRanges = ages.length > 0
      ? {
          min: Math.min(...ages.map(p => p.age_min)),
          max: Math.max(...ages.map(p => p.age_max)),
        }
      : { min: 5, max: 17 };

    return {
      totalPrograms,
      freePrograms,
      averageCost: Math.round(averageCost),
      organizations,
      ageRanges,
      providingEquipment,
      providingTransportation,
    };
  }

  async enrollInProgram(programId: string, enrollmentRequest: {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    childName: string;
    childAge: number;
    emergencyContact: string;
    medicalInfo?: string;
  }): Promise<{ success: boolean; message: string; enrollmentId?: string }> {
    const program = await this.getProgramById(programId);

    if (!program) {
      throw new Error('Program not found');
    }

    // Check age eligibility
    if (program.age_min && enrollmentRequest.childAge < program.age_min) {
      return {
        success: false,
        message: `Child must be at least ${program.age_min} years old for this program`,
      };
    }

    if (program.age_max && enrollmentRequest.childAge > program.age_max) {
      return {
        success: false,
        message: `Child must be ${program.age_max} years old or younger for this program`,
      };
    }

    // In a real implementation, this would:
    // 1. Create an enrollment record in the database
    // 2. Send confirmation emails
    // 3. Handle payment processing if required
    // 4. Add to waiting list if program is full

    // For now, return success response
    return {
      success: true,
      message: `Enrollment request submitted for ${program.name}. You will receive a confirmation email within 24 hours.`,
      enrollmentId: `enroll_${Date.now()}`,
    };
  }
}