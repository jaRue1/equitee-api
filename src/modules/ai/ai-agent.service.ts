import { Injectable } from '@nestjs/common';
import { AIService } from './ai.service';
import { CoursesService } from '../courses/services/courses.service';
import { MentorsService } from '../mentors/mentors.service';
import { YouthProgramsService } from '../youth-programs/youth-programs.service';
import { DemographicsService } from '../demographics/demographics.service';
import { CommunityToolsService } from './community-tools.service';
import { AgentResponse, MapHighlight, ToolInvocation } from './dto/ai.dto';
import { z } from 'zod';

interface AgentContext {
  userId?: string;
  userLocation: { lat: number; lng: number };
  conversationHistory: Array<{ role: string; content: string }>;
  userProfile?: {
    experienceLevel?: string;
    budget?: number;
    age?: number;
    hasEquipment?: boolean;
    hasTransportation?: boolean;
  };
}

@Injectable()
export class AIAgentService {
  constructor(
    private readonly aiService: AIService,
    private readonly coursesService: CoursesService,
    private readonly mentorsService: MentorsService,
    private readonly youthProgramsService: YouthProgramsService,
    private readonly demographicsService: DemographicsService,
    private readonly communityToolsService: CommunityToolsService,
  ) {}

  async processAgentQuery(query: string, context: AgentContext): Promise<AgentResponse> {
    try {
      // Use real AI with function calling
      const response = await this.processWithAI(query, context);

      return {
        success: true,
        message: response.message,
        toolInvocations: response.toolInvocations,
        mapHighlights: response.mapHighlights,
        followUpQuestions: response.followUpQuestions,
      };
    } catch (error) {
      console.error('AI Agent Error:', error);
      // Fallback to rule-based system if AI fails
      const fallbackResponse = await this.processQueryWithTools(query, context);
      return {
        success: true,
        message: fallbackResponse.message,
        toolInvocations: fallbackResponse.toolInvocations,
        mapHighlights: fallbackResponse.mapHighlights,
        followUpQuestions: fallbackResponse.followUpQuestions,
      };
    }
  }

  private async processWithAI(query: string, context: AgentContext): Promise<{
    message: string;
    toolInvocations: ToolInvocation[];
    mapHighlights: MapHighlight[];
    followUpQuestions: string[];
  }> {
    // Define available tools for the AI
    const availableTools = [
      {
        name: 'searchCourses',
        description: 'Search for golf courses near user location with budget and preferences',
        parameters: z.object({
          location: z.object({
            lat: z.number(),
            lng: z.number(),
          }),
          budget: z.number().optional(),
          radius: z.number().optional(),
          youthPrograms: z.boolean().optional(),
        }),
      },
      {
        name: 'findMentors',
        description: 'Find golf mentors and coaches near user location',
        parameters: z.object({
          location: z.object({
            lat: z.number(),
            lng: z.number(),
          }),
          budget: z.number().optional(),
          radius: z.number().optional(),
          specialties: z.array(z.string()).optional(),
        }),
      },
      {
        name: 'findYouthPrograms',
        description: 'Find youth golf programs near user location',
        parameters: z.object({
          location: z.object({
            lat: z.number(),
            lng: z.number(),
          }),
          budget: z.number().optional(),
          radius: z.number().optional(),
          ageRange: z.array(z.number()).optional(),
        }),
      },
      {
        name: 'getAccessibilityScore',
        description: 'Get golf accessibility score for user location',
        parameters: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      },
      {
        name: 'calculateTravelOptions',
        description: 'Calculate travel options to a destination',
        parameters: z.object({
          from: z.object({
            lat: z.number(),
            lng: z.number(),
          }),
          to: z.object({
            lat: z.number(),
            lng: z.number(),
          }),
        }),
      },
    ];

    // Create conversation context for AI
    const messages = [
      {
        role: 'system' as const,
        content: `You are a golf accessibility coach for South Florida. You help users find golf courses, mentors, youth programs, and assess golf accessibility in their area.

Current user context:
- Location: ${context.userLocation.lat}, ${context.userLocation.lng} (Miami Beach area)
- User ID: ${context.userId || 'anonymous'}
- Profile: ${JSON.stringify(context.userProfile || {})}

Available tools:
- searchCourses: Find golf courses with budget/preference filters
- findMentors: Find golf coaches and mentors
- findYouthPrograms: Find youth golf programs
- getAccessibilityScore: Analyze golf accessibility for the area
- calculateTravelOptions: Get transportation options

Guidelines:
1. Always use tools to get real data when users ask about courses, mentors, or programs
2. Provide specific, actionable recommendations
3. Include distance, pricing, and accessibility information
4. Ask follow-up questions to help users take next steps
5. Be encouraging and supportive about golf accessibility

Respond conversationally and use tools when appropriate to provide real data.`,
      },
      {
        role: 'user' as const,
        content: query,
      },
    ];

    // Get AI response with potential tool calls (using Anthropic for more natural conversation)
    const aiResponse = await this.aiService.generateWithTools(messages, availableTools, 'anthropic');

    // Process any tool calls
    const toolInvocations: ToolInvocation[] = [];
    const mapHighlights: MapHighlight[] = [];
    let finalMessage = aiResponse.content;

    for (const toolCall of aiResponse.toolCalls) {
      const toolResult = await this.executeTool(toolCall.name, toolCall.arguments, context);

      toolInvocations.push({
        toolName: toolCall.name,
        toolCallId: `${toolCall.name}_${Date.now()}`,
        args: toolCall.arguments,
        result: toolResult.data,
      });

      // Add map highlights for location-based results
      if (toolResult.mapHighlights) {
        mapHighlights.push(...toolResult.mapHighlights);
      }
    }

    // If we have tool results, update the message with real data
    if (toolInvocations.length > 0) {
      const updatedMessages = [
        ...messages,
        {
          role: 'assistant' as const,
          content: aiResponse.content,
        },
        {
          role: 'user' as const,
          content: `Tool results: ${JSON.stringify(toolInvocations.map(t => ({ tool: t.toolName, result: t.result })))}. Please provide a comprehensive response with this real data.`,
        },
      ];

      const finalResponse = await this.aiService.generateChatResponse(updatedMessages, 'anthropic');
      finalMessage = finalResponse;
    }

    // Generate follow-up questions
    const followUpMessages = [
      ...messages,
      {
        role: 'assistant' as const,
        content: finalMessage,
      },
      {
        role: 'user' as const,
        content: 'Based on this conversation, suggest 3 helpful follow-up questions the user might ask. Return only the questions as a JSON array.',
      },
    ];

    let followUpQuestions: string[] = [];
    try {
      const followUpResponse = await this.aiService.generateChatResponse(followUpMessages, 'anthropic');
      followUpQuestions = JSON.parse(followUpResponse);
    } catch {
      followUpQuestions = [
        "Can you tell me more about any of these options?",
        "How can I get transportation to these locations?",
        "What should I expect for equipment and costs?"
      ];
    }

    return {
      message: finalMessage,
      toolInvocations,
      mapHighlights,
      followUpQuestions,
    };
  }

  private async executeTool(toolName: string, args: any, context: AgentContext): Promise<{
    data: any;
    mapHighlights?: MapHighlight[];
  }> {
    switch (toolName) {
      case 'searchCourses':
        const courses = await this.searchCourses(context, args);
        return {
          data: courses,
          mapHighlights: courses.map(course => ({
            id: course.id,
            lat: course.lat || context.userLocation.lat,
            lng: course.lng || context.userLocation.lng,
            type: 'course',
            name: course.name,
            description: `$${course.green_fee_min}-${course.green_fee_max} • ${course.distance} miles`,
            metadata: course,
          })),
        };

      case 'findMentors':
        const mentors = await this.findMentors(context, args);
        return {
          data: mentors,
          mapHighlights: mentors.map(mentor => ({
            id: mentor.id,
            lat: mentor.user.location_lat || context.userLocation.lat,
            lng: mentor.user.location_lng || context.userLocation.lng,
            type: 'mentor',
            name: mentor.user.name,
            description: `$${mentor.hourly_rate}/hr • ${mentor.distance_miles} miles`,
            metadata: mentor,
          })),
        };

      case 'findYouthPrograms':
        const programs = await this.findYouthPrograms(context, args);
        return {
          data: programs,
          mapHighlights: programs.map(program => ({
            id: program.id,
            lat: program.location_lat || context.userLocation.lat,
            lng: program.location_lng || context.userLocation.lng,
            type: 'program',
            name: program.name,
            description: `${program.cost_per_session === 0 ? 'FREE' : '$' + program.cost_per_session} • ${program.distance_miles} miles`,
            metadata: program,
          })),
        };

      case 'getAccessibilityScore':
        const accessibility = await this.getAccessibilityScore(context);
        return { data: accessibility };

      case 'calculateTravelOptions':
        const travel = await this.calculateTravelOptions(context, args.to);
        return { data: travel };

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async processQueryWithTools(query: string, context: AgentContext): Promise<{
    message: string;
    toolInvocations: ToolInvocation[];
    mapHighlights: MapHighlight[];
    followUpQuestions: string[];
  }> {
    const lowerQuery = query.toLowerCase();
    const toolInvocations: ToolInvocation[] = [];
    const mapHighlights: MapHighlight[] = [];
    let message = '';
    const followUpQuestions: string[] = [];

    // Detect intent and call appropriate tools
    if (lowerQuery.includes('course') || lowerQuery.includes('golf course') || lowerQuery.includes('play golf')) {
      const coursesResult = await this.searchCourses(context);
      toolInvocations.push({
        toolName: 'searchCourses',
        toolCallId: 'search_courses_1',
        args: { location: context.userLocation, budget: context.userProfile?.budget || 100 },
        result: coursesResult,
      });

      if (coursesResult.length > 0) {
        message = `I found ${coursesResult.length} golf courses near you! Here are the best options:\n\n`;
        coursesResult.slice(0, 3).forEach((course, index) => {
          message += `${index + 1}. **${course.name}** - ${course.distance} miles away\n`;
          message += `   • Green fees: $${course.green_fee_min}-${course.green_fee_max}\n`;
          message += `   • ${course.youth_programs ? 'Has youth programs' : 'Adult-focused'}\n`;
          message += `   • ${course.equipment_rental ? 'Equipment rental available' : 'Bring your own clubs'}\n\n`;

          mapHighlights.push({
            id: course.id,
            lat: course.lat || context.userLocation.lat,
            lng: course.lng || context.userLocation.lng,
            type: 'course',
            name: course.name,
            description: `$${course.green_fee_min}-${course.green_fee_max} • ${course.distance} miles`,
            metadata: course,
          });
        });

        followUpQuestions.push(
          "Would you like details about any specific course?",
          "Need help with transportation to these courses?",
          "Looking for playing partners at any of these courses?"
        );
      } else {
        message = "I couldn't find any courses in your immediate area. Let me expand the search radius or suggest some alternatives.";
      }
    }

    else if (lowerQuery.includes('mentor') || lowerQuery.includes('coach') || lowerQuery.includes('lesson') || lowerQuery.includes('instruction')) {
      const mentorsResult = await this.findMentors(context);
      toolInvocations.push({
        toolName: 'findMentorsInArea',
        toolCallId: 'find_mentors_1',
        args: { location: context.userLocation, budget: context.userProfile?.budget || 100 },
        result: mentorsResult,
      });

      if (mentorsResult.length > 0) {
        message = `Great! I found ${mentorsResult.length} golf mentors and coaches in your area:\n\n`;
        mentorsResult.slice(0, 3).forEach((mentor, index) => {
          message += `${index + 1}. **${mentor.user.name}** - ${mentor.distance_miles} miles away\n`;
          message += `   • $${mentor.hourly_rate}/hour • ${mentor.experience_years} years experience\n`;
          message += `   • Specialties: ${mentor.specialties?.join(', ') || 'General instruction'}\n`;
          message += `   • ${mentor.bio}\n\n`;

          mapHighlights.push({
            id: mentor.id,
            lat: context.userLocation.lat, // Would use actual mentor location
            lng: context.userLocation.lng,
            type: 'mentor',
            name: mentor.user.name,
            description: `$${mentor.hourly_rate}/hr • ${mentor.distance_miles} miles`,
            metadata: mentor,
          });
        });

        followUpQuestions.push(
          "Would you like me to help you contact any of these mentors?",
          "Need help with transportation to reach them?",
          "Looking for group lessons or individual instruction?"
        );
      } else {
        message = "I couldn't find any mentors in your immediate area. Let me expand the search or suggest online coaching options.";
      }
    }

    else if (lowerQuery.includes('youth') || lowerQuery.includes('kid') || lowerQuery.includes('child') || lowerQuery.includes('junior')) {
      const programsResult = await this.findYouthPrograms(context);
      toolInvocations.push({
        toolName: 'findYouthPrograms',
        toolCallId: 'find_youth_programs_1',
        args: { location: context.userLocation, budget: context.userProfile?.budget || 50 },
        result: programsResult,
      });

      if (programsResult.length > 0) {
        message = `Perfect! I found ${programsResult.length} youth golf programs nearby:\n\n`;
        programsResult.slice(0, 3).forEach((program, index) => {
          message += `${index + 1}. **${program.name}** (${program.organization})\n`;
          message += `   • ${program.distance_miles} miles away • ${program.cost_per_session === 0 ? 'FREE' : '$' + program.cost_per_session + '/session'}\n`;
          message += `   • Ages: ${program.age_range}\n`;
          message += `   • ${program.equipment_provided ? 'Equipment provided' : 'Bring equipment'}\n`;
          message += `   • Schedule: ${program.schedule_days?.join(', ') || 'Contact for schedule'}\n\n`;

          mapHighlights.push({
            id: program.id,
            lat: context.userLocation.lat, // Would use actual program location
            lng: context.userLocation.lng,
            type: 'program',
            name: program.name,
            description: `${program.cost_per_session === 0 ? 'FREE' : '$' + program.cost_per_session} • ${program.distance_miles} miles`,
            metadata: program,
          });
        });

        followUpQuestions.push(
          "Would you like help enrolling in any of these programs?",
          "Need information about transportation options?",
          "Want to know more about what equipment is needed?"
        );
      } else {
        message = "I couldn't find youth programs in your immediate area. Let me expand the search or suggest alternatives.";
      }
    }

    else if (lowerQuery.includes('accessibility') || lowerQuery.includes('afford') || lowerQuery.includes('budget') || lowerQuery.includes('cost')) {
      const accessibilityResult = await this.getAccessibilityScore(context);
      toolInvocations.push({
        toolName: 'getAccessibilityScore',
        toolCallId: 'accessibility_score_1',
        args: { lat: context.userLocation.lat, lng: context.userLocation.lng },
        result: accessibilityResult,
      });

      message = `Here's your golf accessibility analysis for your area:\n\n`;
      message += `**Accessibility Score: ${Math.round(accessibilityResult.accessibilityScore)}/100**\n\n`;

      if (accessibilityResult.nearestAffordableCourse) {
        message += `**Nearest Affordable Course:**\n`;
        message += `• ${accessibilityResult.nearestAffordableCourse.name}\n`;
        message += `• ${accessibilityResult.nearestAffordableCourse.distance} miles away\n`;
        message += `• Green fees: $${accessibilityResult.nearestAffordableCourse.greenFeeRange.min}-${accessibilityResult.nearestAffordableCourse.greenFeeRange.max}\n\n`;
      }

      message += `**Transportation Options:** ${accessibilityResult.transportationOptions.join(', ')}\n\n`;
      message += `**Estimated Annual Golf Cost:** $${accessibilityResult.estimatedAnnualCost}\n`;

      followUpQuestions.push(
        "Want to see free or low-cost golf options?",
        "Need help finding equipment donations or rentals?",
        "Looking for scholarship programs?"
      );
    }

    else if (lowerQuery.includes('transport') || lowerQuery.includes('travel') || lowerQuery.includes('get there') || lowerQuery.includes('how to reach')) {
      // This would need a specific destination - for demo, use nearest course
      const courses = await this.searchCourses(context);
      if (courses.length > 0) {
        const travelResult = await this.calculateTravelOptions(context, courses[0]);
        toolInvocations.push({
          toolName: 'calculateTravelOptions',
          toolCallId: 'travel_options_1',
          args: { from: context.userLocation, to: { lat: courses[0].lat, lng: courses[0].lng } },
          result: travelResult,
        });

        message = `Here are your transportation options to ${courses[0].name}:\n\n`;
        travelResult.forEach((option, index) => {
          message += `${index + 1}. **${option.mode.toUpperCase()}**: ${option.description}\n`;
        });

        followUpQuestions.push(
          "Need directions to any of these courses?",
          "Looking for carpool options?",
          "Want to explore public transportation routes?"
        );
      } else {
        message = "I'd be happy to help with transportation! First, let me know where you'd like to go - a specific course, mentor, or program?";
      }
    }

    else {
      // General query - provide overview and suggestions
      message = `I'm your golf accessibility coach for South Florida! I can help you with:\n\n`;
      message += `🏌️ **Find Golf Courses** - Discover courses near you within your budget\n`;
      message += `👨‍🏫 **Find Mentors & Coaches** - Connect with local golf professionals\n`;
      message += `👶 **Youth Programs** - Find programs for kids and teens\n`;
      message += `🚗 **Transportation Help** - Get directions and travel options\n`;
      message += `💰 **Accessibility Analysis** - Understand costs and accessibility in your area\n\n`;
      message += `What would you like to explore first?`;

      followUpQuestions.push(
        "Show me nearby golf courses",
        "Find golf mentors in my area",
        "Look for youth golf programs",
        "Check golf accessibility in my area"
      );
    }

    return {
      message,
      toolInvocations,
      mapHighlights,
      followUpQuestions,
    };
  }

  private async searchCourses(context: AgentContext, args: any = {}) {
    // Use real courses service with AI parameters
    const searchParams = {
      lat: args.location?.lat || context.userLocation.lat,
      lng: args.location?.lng || context.userLocation.lng,
      radius: args.radius || 25,
      price: args.budget || context.userProfile?.budget || 100,
      youth_programs: args.youthPrograms,
    };

    const courses = await this.coursesService.findAll(searchParams);

    // Calculate distances manually for courses
    return courses.map(course => ({
      ...course,
      distance: this.calculateDistance(
        searchParams.lat,
        searchParams.lng,
        course.lat,
        course.lng
      ),
    })).sort((a, b) => a.distance - b.distance);
  }

  private async findMentors(context: AgentContext, args: any = {}) {
    return await this.mentorsService.findNearbyMentors({
      location: args.location || context.userLocation,
      budget: args.budget || context.userProfile?.budget || 200,
      radius: args.radius || 30,
      specialties: args.specialties,
    });
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

  private async findYouthPrograms(context: AgentContext, args: any = {}) {
    return await this.youthProgramsService.findNearbyPrograms({
      location: args.location || context.userLocation,
      budget: args.budget || context.userProfile?.budget || 100,
      radius: args.radius || 25,
      ageRange: args.ageRange,
    });
  }

  private async getAccessibilityScore(context: AgentContext) {
    return await this.demographicsService.getAccessibilityScore(
      context.userLocation.lat,
      context.userLocation.lng
    );
  }

  private async calculateTravelOptions(context: AgentContext, destination: any) {
    return await this.communityToolsService.calculateTravelOptions({
      from: context.userLocation,
      to: { lat: destination.lat || context.userLocation.lat, lng: destination.lng || context.userLocation.lng },
      transportModes: ['driving', 'transit', 'walking', 'biking'],
    });
  }
}