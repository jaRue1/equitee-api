import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { GolfGroup, GolfGroupStatus } from '../../entities/golf-group.entity';
import { PartnerRequest, PartnerRequestStatus } from '../../entities/partner-request.entity';
import { GolfGroupMember, MemberStatus } from '../../entities/golf-group-member.entity';
import {
  CreateGolfGroupRequest,
  CreatePartnerRequestRequest,
  FindPlayingPartnersRequest,
  GolfGroupWithDetails,
  PartnerRequestWithDetails,
  PlayingPartnersResponse,
} from './dto/community.dto';

@Injectable()
export class CommunityService {
  constructor(private supabaseService: SupabaseService) {}

  async createGolfGroup(request: CreateGolfGroupRequest): Promise<GolfGroupWithDetails> {
    const { data: group, error } = await this.supabaseService
      .getClient()
      .from('golf_groups')
      .insert({
        course_id: request.courseId,
        created_by: request.createdBy,
        scheduled_date: request.scheduledDate,
        scheduled_time: request.scheduledTime,
        max_members: request.maxPlayers,
        skill_level: request.skillLevel,
        description: request.description,
        current_members: 1,
        status: GolfGroupStatus.OPEN,
      })
      .select(`
        *,
        courses (name, address),
        users!golf_groups_created_by_fkey (name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create golf group: ${error.message}`);
    }

    // Add the creator as the first member
    await this.supabaseService
      .getClient()
      .from('golf_group_members')
      .insert({
        group_id: group.id,
        user_id: request.createdBy,
        status: MemberStatus.CONFIRMED,
      });

    return {
      ...group,
      course: group.courses,
      creator: group.users,
    };
  }

  async joinGolfGroup(groupId: string, userId: string): Promise<{ success: boolean; message: string }> {
    // First, check if the group exists and has space
    const { data: group, error: groupError } = await this.supabaseService
      .getClient()
      .from('golf_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      throw new Error('Golf group not found');
    }

    if (group.status !== GolfGroupStatus.OPEN) {
      return {
        success: false,
        message: 'This golf group is no longer accepting members',
      };
    }

    if (group.current_members >= group.max_members) {
      return {
        success: false,
        message: 'This golf group is already full',
      };
    }

    // Check if user is already a member
    const { data: existingMember } = await this.supabaseService
      .getClient()
      .from('golf_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return {
        success: false,
        message: 'You are already a member of this golf group',
      };
    }

    // Add user to the group
    const { error: memberError } = await this.supabaseService
      .getClient()
      .from('golf_group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        status: MemberStatus.CONFIRMED,
      });

    if (memberError) {
      throw new Error(`Failed to join golf group: ${memberError.message}`);
    }

    // Update member count
    const newMemberCount = group.current_members + 1;
    const newStatus = newMemberCount >= group.max_members ? GolfGroupStatus.FULL : GolfGroupStatus.OPEN;

    await this.supabaseService
      .getClient()
      .from('golf_groups')
      .update({
        current_members: newMemberCount,
        status: newStatus,
      })
      .eq('id', groupId);

    return {
      success: true,
      message: 'Successfully joined the golf group!',
    };
  }

  async createPartnerRequest(request: CreatePartnerRequestRequest): Promise<PartnerRequestWithDetails> {
    const { data: partnerRequest, error } = await this.supabaseService
      .getClient()
      .from('partner_requests')
      .insert({
        user_id: request.userId,
        course_id: request.courseId,
        preferred_date: request.preferredDate,
        preferred_time: request.preferredTime,
        skill_level: request.skillLevel,
        message: request.message,
        status: PartnerRequestStatus.ACTIVE,
      })
      .select(`
        *,
        users (name, golf_experience),
        courses (name, address)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create partner request: ${error.message}`);
    }

    return {
      ...partnerRequest,
      user: partnerRequest.users,
      course: partnerRequest.courses,
    };
  }

  async findPlayingPartners(request: FindPlayingPartnersRequest): Promise<PlayingPartnersResponse> {
    const { courseId, date, skillLevel } = request;

    // Find existing groups with open spots
    let groupsQuery = this.supabaseService
      .getClient()
      .from('golf_groups')
      .select(`
        *,
        courses (name, address),
        users!golf_groups_created_by_fkey (name),
        golf_group_members (
          id,
          user_id,
          status,
          joined_at,
          users (name)
        )
      `)
      .eq('course_id', courseId)
      .eq('scheduled_date', date)
      .eq('status', GolfGroupStatus.OPEN);

    if (skillLevel) {
      groupsQuery = groupsQuery.eq('skill_level', skillLevel);
    }

    const { data: allGroups, error: groupsError } = await groupsQuery;

    if (groupsError) {
      throw new Error(`Failed to find golf groups: ${groupsError.message}`);
    }

    // Filter groups that have available spots
    const groups = (allGroups || []).filter(group => group.current_members < group.max_members);

    // Find individual partner requests
    let individualsQuery = this.supabaseService
      .getClient()
      .from('partner_requests')
      .select(`
        *,
        users (name, golf_experience),
        courses (name, address)
      `)
      .eq('course_id', courseId)
      .eq('status', PartnerRequestStatus.ACTIVE);

    if (date) {
      individualsQuery = individualsQuery.eq('preferred_date', date);
    }

    if (skillLevel) {
      individualsQuery = individualsQuery.eq('skill_level', skillLevel);
    }

    const { data: individuals, error: individualsError } = await individualsQuery;

    if (individualsError) {
      throw new Error(`Failed to find partner requests: ${individualsError.message}`);
    }

    const formattedGroups: GolfGroupWithDetails[] = (groups || []).map(group => ({
      ...group,
      course: group.courses,
      creator: group.users,
      members: group.golf_group_members?.map(member => ({
        ...member,
        user: member.users,
      })),
    }));

    const formattedIndividuals: PartnerRequestWithDetails[] = (individuals || []).map(individual => ({
      ...individual,
      user: individual.users,
      course: individual.courses,
    }));

    return {
      groups: formattedGroups,
      individuals: formattedIndividuals,
    };
  }

  async getGolfGroupById(groupId: string): Promise<GolfGroupWithDetails | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('golf_groups')
      .select(`
        *,
        courses (name, address),
        users!golf_groups_created_by_fkey (name),
        golf_group_members (
          id,
          user_id,
          status,
          joined_at,
          users (name)
        )
      `)
      .eq('id', groupId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get golf group: ${error.message}`);
    }

    return {
      ...data,
      course: data.courses,
      creator: data.users,
      members: data.golf_group_members?.map(member => ({
        ...member,
        user: member.users,
      })),
    };
  }

  async getUserGolfGroups(userId: string): Promise<GolfGroupWithDetails[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('golf_group_members')
      .select(`
        golf_groups (
          *,
          courses (name, address),
          users!golf_groups_created_by_fkey (name)
        )
      `)
      .eq('user_id', userId)
      .in('status', [MemberStatus.CONFIRMED, MemberStatus.PENDING]);

    if (error) {
      throw new Error(`Failed to get user golf groups: ${error.message}`);
    }

    return (data || []).map((item: any) => {
      const group = item.golf_groups as any;
      return {
        id: group.id,
        course_id: group.course_id,
        created_by: group.created_by,
        scheduled_date: group.scheduled_date,
        scheduled_time: group.scheduled_time,
        max_members: group.max_members,
        current_members: group.current_members,
        skill_level: group.skill_level,
        description: group.description,
        status: group.status,
        created_at: group.created_at,
        course: group.courses,
        creator: group.users,
      };
    });
  }

  async getUserPartnerRequests(userId: string): Promise<PartnerRequestWithDetails[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('partner_requests')
      .select(`
        *,
        courses (name, address)
      `)
      .eq('user_id', userId)
      .in('status', [PartnerRequestStatus.ACTIVE, PartnerRequestStatus.MATCHED])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user partner requests: ${error.message}`);
    }

    return (data || []).map(request => ({
      ...request,
      course: request.courses,
    }));
  }

  async leaveGolfGroup(groupId: string, userId: string): Promise<{ success: boolean; message: string }> {
    // Check if user is a member
    const { data: member, error: memberError } = await this.supabaseService
      .getClient()
      .from('golf_group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        message: 'You are not a member of this golf group',
      };
    }

    // Remove user from group
    const { error: deleteError } = await this.supabaseService
      .getClient()
      .from('golf_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (deleteError) {
      throw new Error(`Failed to leave golf group: ${deleteError.message}`);
    }

    // Update member count and status
    const { data: group } = await this.supabaseService
      .getClient()
      .from('golf_groups')
      .select('current_members, max_members')
      .eq('id', groupId)
      .single();

    if (group) {
      const newMemberCount = group.current_members - 1;
      await this.supabaseService
        .getClient()
        .from('golf_groups')
        .update({
          current_members: newMemberCount,
          status: newMemberCount < group.max_members ? GolfGroupStatus.OPEN : GolfGroupStatus.FULL,
        })
        .eq('id', groupId);
    }

    return {
      success: true,
      message: 'Successfully left the golf group',
    };
  }

  async cancelPartnerRequest(requestId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const { error } = await this.supabaseService
      .getClient()
      .from('partner_requests')
      .update({ status: PartnerRequestStatus.CANCELLED })
      .eq('id', requestId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to cancel partner request: ${error.message}`);
    }

    return {
      success: true,
      message: 'Partner request cancelled successfully',
    };
  }
}