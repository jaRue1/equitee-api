import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';
import { AIService } from '../ai/ai.service';
import { ChatConversation, ConversationMode, ConversationStep } from '../../entities/chat-conversation.entity';
import { ChatMessage, MessageSender, MessageType } from '../../entities/chat-message.entity';
import { ConversationResponse, MessageResponse } from './dto/chat.dto';
import { v4 as uuidv4 } from 'uuid';

interface ConversationState {
  id: string;
  userId?: string;
  currentStep: string;
  responses: Record<string, any>;
  userLocation: { lat: number; lng: number };
  mode: ConversationMode;
  userProfile?: {
    experienceLevel?: string;
    budget?: number;
    age?: number;
    hasEquipment?: boolean;
    hasTransportation?: boolean;
  };
}

@Injectable()
export class ChatService {
  private conversations = new Map<string, ConversationState>();

  constructor(
    private supabaseService: SupabaseService,
    private aiService: AIService
  ) {}

  async startConversation(userLocation: { lat: number; lng: number }, userId?: string): Promise<ConversationResponse> {
    const conversationId = uuidv4();

    const state: ConversationState = {
      id: conversationId,
      userId,
      currentStep: ConversationStep.EXPERIENCE,
      responses: {},
      userLocation,
      mode: ConversationMode.ONBOARDING,
    };

    this.conversations.set(conversationId, state);

    // Store in database
    await this.saveConversationToDb(state);

    return {
      conversationId,
      message: "Welcome to EquiTee! I'm your golf accessibility coach. Let's find the best golf opportunities for you. Have you ever played golf before?",
      options: ["Yes, I've played before", "No, I'm completely new", "I've tried it a few times"],
      mode: ConversationMode.ONBOARDING,
    };
  }

  async processMessage(conversationId: string, userMessage: string, metadata?: Record<string, any>): Promise<MessageResponse> {
    const state = this.conversations.get(conversationId);

    if (!state) {
      // Try to load from database
      const dbState = await this.loadConversationFromDb(conversationId);
      if (!dbState) {
        throw new Error('Conversation not found');
      }
      this.conversations.set(conversationId, dbState);
      return this.processMessage(conversationId, userMessage, metadata);
    }

    // Save user message
    await this.saveMessageToDb(conversationId, MessageSender.USER, userMessage, MessageType.TEXT, metadata);

    let response: MessageResponse;

    if (state.mode === ConversationMode.ONBOARDING) {
      response = await this.handleOnboardingFlow(state, userMessage);
    } else {
      // AI mode - will be handled by AI Agent service
      response = {
        success: true,
        message: "AI consultant mode not yet implemented. Please complete onboarding first.",
      };
    }

    // Save AI response
    await this.saveMessageToDb(conversationId, MessageSender.AI, response.message, MessageType.TEXT);

    // Update conversation state
    await this.updateConversationInDb(state);

    return response;
  }

  private async handleOnboardingFlow(state: ConversationState, userResponse: string): Promise<MessageResponse> {
    switch (state.currentStep) {
      case ConversationStep.EXPERIENCE:
        return this.handleExperienceStep(state, userResponse);

      case ConversationStep.SKILL_LEVEL:
        return this.handleSkillLevelStep(state, userResponse);

      case ConversationStep.BUDGET:
        return this.handleBudgetStep(state, userResponse);

      case ConversationStep.RECOMMENDATIONS:
        return this.handleRecommendationsStep(state, userResponse);

      default:
        return {
          success: false,
          message: "I'm not sure how to help with that. Let me restart our conversation.",
        };
    }
  }

  private async handleExperienceStep(state: ConversationState, response: string): Promise<MessageResponse> {
    let experienceLevel: string;

    if (response.toLowerCase().includes('new') || response.toLowerCase().includes('never')) {
      experienceLevel = 'beginner';
    } else if (response.toLowerCase().includes('few times') || response.toLowerCase().includes('tried')) {
      experienceLevel = 'novice';
    } else {
      experienceLevel = 'experienced';
    }

    state.responses.experience = experienceLevel;
    state.currentStep = ConversationStep.SKILL_LEVEL;

    let message: string;
    let options: string[];

    if (experienceLevel === 'beginner') {
      message = "Perfect! Golf is an amazing sport to start. What's most important to you when getting started?";
      options = [
        "Learning proper fundamentals with lessons",
        "Finding affordable ways to try golf",
        "Connecting with other beginners",
        "Finding youth programs for my child"
      ];
    } else {
      message = "Great! Since you have some experience, what would you like to focus on?";
      options = [
        "Improving my skills with coaching",
        "Finding playing partners",
        "Discovering new courses",
        "Getting better equipment"
      ];
    }

    return {
      success: true,
      message,
      options,
      nextStep: {
        step: ConversationStep.SKILL_LEVEL,
        question: message,
        options,
      },
    };
  }

  private async handleSkillLevelStep(state: ConversationState, response: string): Promise<MessageResponse> {
    state.responses.focus = response;
    state.currentStep = ConversationStep.BUDGET;

    const message = "To give you the best recommendations, what's your budget range for golf activities?";
    const options = [
      "Under $50/month (looking for free/low-cost options)",
      "$50-150/month (occasional rounds and lessons)",
      "$150-300/month (regular play and instruction)",
      "$300+/month (premium experiences)"
    ];

    return {
      success: true,
      message,
      options,
      nextStep: {
        step: ConversationStep.BUDGET,
        question: message,
        options,
      },
    };
  }

  private async handleBudgetStep(state: ConversationState, response: string): Promise<MessageResponse> {
    let budget: number;

    if (response.includes('Under $50')) {
      budget = 50;
    } else if (response.includes('$50-150')) {
      budget = 150;
    } else if (response.includes('$150-300')) {
      budget = 300;
    } else {
      budget = 500;
    }

    state.responses.budget = budget;
    state.currentStep = ConversationStep.RECOMMENDATIONS;

    // Generate recommendations based on collected info
    const recommendations = await this.generateRecommendations(state);

    return {
      success: true,
      message: "Perfect! Based on your preferences, here are my top recommendations for you:",
      recommendations,
      mapHighlights: recommendations.map(rec => ({
        id: rec.id,
        lat: rec.location?.lat || state.userLocation.lat,
        lng: rec.location?.lng || state.userLocation.lng,
        type: rec.type,
        name: rec.name,
      })),
      nextStep: {
        step: ConversationStep.AI_MODE,
        question: "Would you like me to help you with anything else? I can find specific courses, mentors, or playing partners!",
      },
    };
  }

  private async handleRecommendationsStep(state: ConversationState, response: string): Promise<MessageResponse> {
    // Transition to AI mode
    state.mode = ConversationMode.AI_CONSULTANT;
    state.currentStep = ConversationStep.AI_MODE;

    return {
      success: true,
      message: "Great! I'm now ready to help you with any golf-related questions. I can find courses, mentors, youth programs, playing partners, and give you personalized advice. What would you like to explore?",
    };
  }

  private async generateRecommendations(state: ConversationState) {
    const { userLocation } = state;
    const budget = state.responses.budget || 100;
    const experienceLevel = state.responses.experience || 'beginner';
    const focus = state.responses.focus || '';

    const recommendations = [];

    // Always recommend nearby courses
    const nearestCourses = await this.findNearestCourses(userLocation, budget);
    recommendations.push(...nearestCourses.slice(0, 2));

    // If beginner or looking for lessons, recommend mentors
    if (experienceLevel === 'beginner' || focus.toLowerCase().includes('lesson') || focus.toLowerCase().includes('coaching')) {
      const mentors = await this.findNearestMentors(userLocation, budget);
      recommendations.push(...mentors.slice(0, 2));
    }

    // If looking for youth programs or budget-conscious
    if (focus.toLowerCase().includes('youth') || budget <= 50) {
      const youthPrograms = await this.findNearestYouthPrograms(userLocation, budget);
      recommendations.push(...youthPrograms.slice(0, 2));
    }

    return recommendations;
  }

  private async findNearestCourses(location: { lat: number; lng: number }, budget: number) {
    const { data } = await this.supabaseService
      .getClient()
      .rpc('find_courses_nearby', {
        user_lat: location.lat,
        user_lng: location.lng,
        max_distance: 25,
        max_green_fee: budget,
      });

    return (data || []).map(course => ({
      id: course.id,
      name: course.name,
      type: 'course',
      description: `${course.distance_miles} miles away • $${course.green_fee_min}-${course.green_fee_max} green fees`,
      location: { lat: location.lat, lng: location.lng }, // Would use actual course coordinates
      metadata: {
        distance: course.distance_miles,
        greenFeeRange: [course.green_fee_min, course.green_fee_max],
        youthPrograms: course.youth_programs,
        equipmentRental: course.equipment_rental,
      },
    }));
  }

  private async findNearestMentors(location: { lat: number; lng: number }, budget: number) {
    const { data } = await this.supabaseService
      .getClient()
      .rpc('find_mentors_nearby', {
        user_lat: location.lat,
        user_lng: location.lng,
        max_distance: 30,
        max_hourly_rate: budget,
      });

    return (data || []).map(mentor => ({
      id: mentor.id,
      name: mentor.name,
      type: 'mentor',
      description: `${mentor.distance_miles} miles away • $${mentor.hourly_rate}/hour • ${mentor.experience_years} years experience`,
      location: { lat: location.lat, lng: location.lng }, // Would use actual mentor coordinates
      metadata: {
        distance: mentor.distance_miles,
        hourlyRate: mentor.hourly_rate,
        specialties: mentor.specialties,
        experience: mentor.experience_years,
      },
    }));
  }

  private async findNearestYouthPrograms(location: { lat: number; lng: number }, budget: number) {
    const { data } = await this.supabaseService
      .getClient()
      .rpc('find_youth_programs_nearby', {
        user_lat: location.lat,
        user_lng: location.lng,
        max_distance: 25,
        max_cost: budget,
        min_age: 5,
        max_age: 17,
      });

    return (data || []).map(program => ({
      id: program.id,
      name: program.name,
      type: 'program',
      description: `${program.distance_miles} miles away • $${program.cost_per_session}/session • Ages ${program.age_range}`,
      location: { lat: location.lat, lng: location.lng }, // Would use actual program coordinates
      metadata: {
        distance: program.distance_miles,
        cost: program.cost_per_session,
        ageRange: program.age_range,
        organization: program.organization,
      },
    }));
  }

  private async saveConversationToDb(state: ConversationState): Promise<void> {
    await this.supabaseService
      .getClient()
      .from('chat_conversations')
      .insert({
        id: state.id,
        user_id: state.userId,
        conversation_state: {
          responses: state.responses,
          userProfile: state.userProfile,
        },
        current_step: state.currentStep,
        user_location: state.userLocation,
        mode: state.mode,
      });
  }

  private async updateConversationInDb(state: ConversationState): Promise<void> {
    await this.supabaseService
      .getClient()
      .from('chat_conversations')
      .update({
        conversation_state: {
          responses: state.responses,
          userProfile: state.userProfile,
        },
        current_step: state.currentStep,
        mode: state.mode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', state.id);
  }

  private async loadConversationFromDb(conversationId: string): Promise<ConversationState | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      currentStep: data.current_step,
      responses: data.conversation_state?.responses || {},
      userLocation: data.user_location,
      mode: data.mode,
      userProfile: data.conversation_state?.userProfile,
    };
  }

  private async saveMessageToDb(
    conversationId: string,
    sender: MessageSender,
    message: string,
    messageType: MessageType = MessageType.TEXT,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.supabaseService
      .getClient()
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender,
        message,
        message_type: messageType,
        metadata,
      });
  }

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get conversation history: ${error.message}`);
    }

    return data || [];
  }

  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user conversations: ${error.message}`);
    }

    return data || [];
  }
}