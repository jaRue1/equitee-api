import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../../database/supabase.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { EquipmentFiltersDto } from '../dto/equipment-filters.dto';
import { ClaimEquipmentDto } from '../dto/claim-equipment.dto';
import { Equipment, EquipmentStatus } from '../../../entities/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    const { data, error } = await this.supabaseService
      .from('equipment')
      .insert(createEquipmentDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create equipment: ${error.message}`);
    }

    return data;
  }

  async findAll(filters?: EquipmentFiltersDto): Promise<Equipment[]> {
    let query = this.supabaseService
      .from('equipment')
      .select('*');

    if (filters) {
      // Filter by equipment type
      if (filters.equipment_type) {
        query = query.eq('equipment_type', filters.equipment_type);
      }

      // Filter by condition
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }

      // Filter by status
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // Default to available only
        query = query.eq('status', EquipmentStatus.AVAILABLE);
      }

      // Filter by price range
      if (filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
      }

      // TODO: Implement location-based filtering
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch equipment: ${error.message}`);
    }

    return data || [];
  }

  async findOne(id: string): Promise<Equipment> {
    const { data, error } = await this.supabaseService
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return data;
  }

  async claimEquipment(id: string, claimDto: ClaimEquipmentDto): Promise<Equipment> {
    // First check if equipment exists and is available
    const equipment = await this.findOne(id);

    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      throw new BadRequestException('Equipment is not available for claiming');
    }

    if (equipment.user_id === claimDto.claimer_id) {
      throw new BadRequestException('You cannot claim your own equipment');
    }

    // Update equipment status to pending
    const { data, error } = await this.supabaseService
      .from('equipment')
      .update({ status: EquipmentStatus.PENDING })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to claim equipment: ${error?.message}`);
    }

    // TODO: Implement messaging system to notify the owner
    // For now, we'll just update the status

    return data;
  }

  async getRecommendations(userId: string): Promise<Equipment[]> {
    // Get user to understand their preferences
    const { data: user } = await this.supabaseService
      .from('users')
      .select('golf_experience, age, location_lat, location_lng')
      .eq('id', userId)
      .single();

    let query = this.supabaseService
      .from('equipment')
      .select('*')
      .eq('status', EquipmentStatus.AVAILABLE)
      .neq('user_id', userId); // Don't recommend user's own equipment

    // Basic recommendations based on user profile
    if (user?.golf_experience === 'beginner') {
      // Recommend basic equipment for beginners
      query = query.in('equipment_type', ['driver', 'irons', 'putter']);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }

    return data || [];
  }

  async update(id: string, updateDto: Partial<CreateEquipmentDto>): Promise<Equipment> {
    const { data, error } = await this.supabaseService
      .from('equipment')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .from('equipment')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }
  }

  async findByUser(userId: string): Promise<Equipment[]> {
    const { data, error } = await this.supabaseService
      .from('equipment')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user equipment: ${error.message}`);
    }

    return data || [];
  }
}