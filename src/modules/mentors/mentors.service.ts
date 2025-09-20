import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { Mentor } from '../../entities/mentor.entity';
import { MentorWithUserDto } from './dto/mentors.dto';

interface FindMentorsParams {
  location: { lat: number; lng: number };
  experienceLevel?: string;
  budget?: number;
  radius?: number;
  specialties?: string[];
}


@Injectable()
export class MentorsService {
  constructor(private supabaseService: SupabaseService) {}

  async findNearbyMentors(params: FindMentorsParams): Promise<MentorWithUserDto[]> {
    const { location, budget = 200, radius = 30 } = params;

    // Get all mentors with user data and calculate distance manually
    const { data, error } = await this.supabaseService
      .getClient()
      .from('mentors')
      .select(`
        *,
        users (
          name,
          email,
          location_lat,
          location_lng
        )
      `)
      .eq('available', true)
      .lte('hourly_rate', budget);

    if (error) {
      throw new Error(`Failed to find nearby mentors: ${error.message}`);
    }

    // Calculate distances and filter by radius
    const mentorsWithDistance = (data || [])
      .map(mentor => {
        if (!mentor.users?.location_lat || !mentor.users?.location_lng) {
          return null;
        }

        const distance = this.calculateDistance(
          location.lat,
          location.lng,
          mentor.users.location_lat,
          mentor.users.location_lng
        );

        return {
          ...mentor,
          distance_miles: distance,
        };
      })
      .filter(mentor => mentor && mentor.distance_miles <= radius)
      .sort((a, b) => a.distance_miles - b.distance_miles);

    // If specialties filter is provided, filter results
    let filteredData = mentorsWithDistance;
    if (params.specialties && params.specialties.length > 0) {
      filteredData = filteredData.filter(mentor =>
        mentor.specialties && mentor.specialties.some(specialty =>
          params.specialties.includes(specialty)
        )
      );
    }

    return filteredData.map(mentor => ({
      id: mentor.id,
      user_id: mentor.user_id,
      bio: mentor.bio,
      experience_years: mentor.experience_years,
      hourly_rate: mentor.hourly_rate,
      available: true,
      specialties: mentor.specialties,
      certifications: mentor.certifications,
      location_radius: mentor.location_radius,
      contact_info: mentor.contact_info,
      created_at: mentor.created_at,
      user: {
        name: mentor.users.name,
        email: mentor.users.email,
        location_lat: mentor.users.location_lat,
        location_lng: mentor.users.location_lng,
      },
      distance_miles: mentor.distance_miles,
    }));
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  async getMentorById(mentorId: string): Promise<MentorWithUserDto | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('mentors')
      .select(`
        *,
        users (
          name,
          email,
          location_lat,
          location_lng
        )
      `)
      .eq('id', mentorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get mentor: ${error.message}`);
    }

    return {
      ...data,
      user: data.users,
    };
  }

  async getAllMentors(): Promise<MentorWithUserDto[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('mentors')
      .select(`
        *,
        users (
          name,
          email,
          location_lat,
          location_lng
        )
      `)
      .eq('available', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get mentors: ${error.message}`);
    }

    return data.map(mentor => ({
      ...mentor,
      user: mentor.users,
    }));
  }

  async getMentorsBySpecialty(specialty: string): Promise<MentorWithUserDto[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('mentors')
      .select(`
        *,
        users (
          name,
          email,
          location_lat,
          location_lng
        )
      `)
      .contains('specialties', [specialty])
      .eq('available', true)
      .order('hourly_rate', { ascending: true });

    if (error) {
      throw new Error(`Failed to get mentors by specialty: ${error.message}`);
    }

    return data.map(mentor => ({
      ...mentor,
      user: mentor.users,
    }));
  }

  async contactMentor(mentorId: string, contactRequest: {
    userId: string;
    message: string;
    preferredContact: string; // 'email' | 'phone'
  }): Promise<{ success: boolean; message: string }> {
    const mentor = await this.getMentorById(mentorId);

    if (!mentor) {
      throw new Error('Mentor not found');
    }

    // In a real implementation, this would:
    // 1. Create a contact record in the database
    // 2. Send an email/notification to the mentor
    // 3. Send a confirmation to the user

    // For now, return success response
    return {
      success: true,
      message: `Contact request sent to ${mentor.user.name}. They will reach out to you within 24 hours.`,
    };
  }

  async getAvailableSpecialties(): Promise<string[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('mentors')
      .select('specialties')
      .eq('available', true);

    if (error) {
      throw new Error(`Failed to get specialties: ${error.message}`);
    }

    // Extract all unique specialties
    const allSpecialties = data
      .filter(mentor => mentor.specialties)
      .flatMap(mentor => mentor.specialties);

    return [...new Set(allSpecialties)].sort();
  }

  async getMentorStats(): Promise<{
    totalMentors: number;
    averageHourlyRate: number;
    availableSpecialties: string[];
    experienceRange: { min: number; max: number };
  }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('mentors')
      .select('hourly_rate, experience_years, specialties')
      .eq('available', true);

    if (error) {
      throw new Error(`Failed to get mentor stats: ${error.message}`);
    }

    const totalMentors = data.length;
    const rates = data.filter(m => m.hourly_rate).map(m => m.hourly_rate);
    const experience = data.filter(m => m.experience_years).map(m => m.experience_years);

    const averageHourlyRate = rates.length > 0
      ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length
      : 0;

    const experienceRange = experience.length > 0
      ? { min: Math.min(...experience), max: Math.max(...experience) }
      : { min: 0, max: 0 };

    const availableSpecialties = await this.getAvailableSpecialties();

    return {
      totalMentors,
      averageHourlyRate: Math.round(averageHourlyRate),
      availableSpecialties,
      experienceRange,
    };
  }
}