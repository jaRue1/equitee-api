# EquiTee Backend Development Specification - Final

## Project Structure
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts
│   ├── chat/
│   │   ├── chat.module.ts
│   │   ├── chat.controller.ts
│   │   ├── chat.service.ts
│   │   └── dto/
│   ├── ai/
│   │   ├── ai.module.ts
│   │   ├── ai.controller.ts
│   │   ├── ai-agent.service.ts
│   │   └── community-tools.service.ts
│   ├── courses/
│   │   ├── courses.module.ts
│   │   ├── courses.controller.ts
│   │   ├── courses.service.ts
│   │   └── entities/
│   ├── community/
│   │   ├── community.module.ts
│   │   ├── community.controller.ts
│   │   ├── community.service.ts
│   │   └── dto/
│   ├── demographics/
│   │   ├── demographics.module.ts
│   │   ├── demographics.controller.ts
│   │   └── demographics.service.ts
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       └── users.service.ts
├── database/
│   ├── migrations/
│   └── seeds/
├── common/
│   ├── dto/
│   ├── interfaces/
│   └── utils/
└── config/
    ├── database.config.ts
    └── supabase.config.ts
```

## Phase 1: Core Infrastructure (Hours 0-1.5)

### Census Data Integration
**File:** `src/modules/demographics/demographics.service.ts`
```typescript
@Injectable()
export class DemographicsService {
  
  // Data Source: US Census Bureau American Community Survey
  // API: https://api.census.gov/data/2022/acs/acs5
  // Alternative: Pre-downloaded CSV data for reliability
  
  async seedDemographicData() {
    // Target zip codes: 33xxx (Miami-Dade, Broward, Palm Beach)
    // Required fields: zip_code, median_household_income, population
    // Insert into demographics table via Supabase
  }
  
  async getDemographicsByZip(zipCode: string) {
    // Return: { zipCode, medianIncome, population, county }
  }
  
  async getHeatmapData() {
    // Return all South Florida zip codes with demographic data
    // Include GeoJSON boundaries for mapping
  }
}
```

**Database Schema:**
```sql
CREATE TABLE demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(5) NOT NULL UNIQUE,
  median_income INTEGER NOT NULL,
  population INTEGER,
  county VARCHAR(50),
  geojson_bounds JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_demographics_zip ON demographics(zip_code);
CREATE INDEX idx_demographics_income ON demographics(median_income);
```

### Basic Chat System (Phase 1 - Branching Logic)
**File:** `src/modules/chat/chat.service.ts`
```typescript
interface ConversationState {
  id: string;
  userId?: string;
  currentStep: 'experience' | 'skill_level' | 'budget' | 'recommendations' | 'ai_mode';
  responses: Record<string, any>;
  userLocation: { lat: number; lng: number };
  mode: 'onboarding' | 'ai_consultant';
}

@Injectable()
export class ChatService {
  private conversations = new Map<string, ConversationState>();
  
  async startConversation(userLocation: { lat: number; lng: number }) {
    const conversationId = uuidv4();
    const state: ConversationState = {
      id: conversationId,
      currentStep: 'experience',
      responses: {},
      userLocation,
      mode: 'onboarding'
    };
    
    this.conversations.set(conversationId, state);
    
    return {
      conversationId,
      message: "Welcome to EquiTee! Have you ever played golf before?",
      options: ["Yes", "No"],
      mode: 'onboarding'
    };
  }
  
  async processResponse(conversationId: string, userResponse: string) {
    const state = this.conversations.get(conversationId);
    
    // Phase 1: Handle onboarding flow with branching logic
    if (state.mode === 'onboarding') {
      return this.handleOnboardingFlow(state, userResponse);
    }
    
    // Phase 2: Handle AI consultant queries (implemented in Phase 3)
    if (state.mode === 'ai_consultant') {
      return this.aiAgentService.processAgentQuery(userResponse, {
        userId: state.userId,
        userLocation: state.userLocation,
        conversationHistory: [],
        userProfile: this.extractUserProfile(state.responses)
      });
    }
  }
  
  private async handleOnboardingFlow(state: ConversationState, response: string) {
    // Basic branching logic for structured onboarding
    // After completion, offer transition to AI mode
  }
}
```

### Demographic API Endpoints
**File:** `src/modules/demographics/demographics.controller.ts`
```typescript
@Controller('demographics')
export class DemographicsController {
  
  @Get('heatmap')
  async getHeatmapData() {
    // Return all zip codes with income data for map visualization
    // Format: Array of { zipCode, medianIncome, bounds, accessibilityScore }
  }
  
  @Get('accessibility-score/:lat/:lng')
  async getAccessibilityScore(
    @Param('lat') lat: number,
    @Param('lng') lng: number
  ) {
    // Calculate accessibility score based on:
    // - Local median income
    // - Distance to nearest affordable course
    // - Transportation options
    return { accessibilityScore, nearestCourse, estimatedCost };
  }
}
```

## Phase 2: Heat Map Data Processing (Hours 1.5-3.5)

### Accessibility Score Calculation
**File:** `src/modules/demographics/accessibility.calculator.ts`
```typescript
interface AccessibilityFactors {
  localMedianIncome: number;
  nearestAffordableCourse: {
    distance: number;
    greenFee: number;
    youthPrograms: boolean;
  };
  transportationScore: number; // 1-10 based on public transit access
}

export class AccessibilityCalculator {
  
  static calculateScore(factors: AccessibilityFactors): number {
    // Formula: (income / course_cost) * distance_factor * transport_factor
    // Normalized to 0-100 scale
    
    const affordabilityRatio = factors.localMedianIncome / (factors.nearestAffordableCourse.greenFee * 52); // Annual cost
    const distancePenalty = Math.max(0.1, 1 - (factors.nearestAffordableCourse.distance / 50)); // 50 mile max
    const transportBonus = factors.transportationScore / 10;
    const youthProgramBonus = factors.nearestAffordableCourse.youthPrograms ? 1.2 : 1.0;
    
    const rawScore = affordabilityRatio * distancePenalty * transportBonus * youthProgramBonus;
    return Math.min(100, Math.max(0, rawScore * 10)); // Scale to 0-100
  }
}
```

### Data Processing Pipeline
**File:** `src/modules/demographics/data-processor.service.ts`
```typescript
@Injectable()
export class DataProcessorService {
  
  async processRawCensusData(csvData: string) {
    // Parse CSV data from Census Bureau
    // Clean and validate income data
    // Handle missing or invalid zip codes
    // Store in demographics table
  }
  
  async precomputeAccessibilityScores() {
    // For each zip code:
    // 1. Find nearest courses within 25 mile radius
    // 2. Calculate accessibility score
    // 3. Store results for fast API response
    
    const zipCodes = await this.getAllZipCodes();
    const courses = await this.coursesService.getAllCourses();
    
    for (const zipCode of zipCodes) {
      const nearestCourses = this.findNearestCourses(zipCode, courses, 25);
      const score = AccessibilityCalculator.calculateScore({
        localMedianIncome: zipCode.medianIncome,
        nearestAffordableCourse: nearestCourses[0],
        transportationScore: await this.calculateTransportScore(zipCode, nearestCourses[0])
      });
      
      await this.storeAccessibilityScore(zipCode.code, score);
    }
  }
}
```

### Optimized Data Structure
**Database Schema Updates:**
```sql
CREATE TABLE accessibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(5) NOT NULL,
  course_id UUID REFERENCES courses(id),
  accessibility_score DECIMAL(5,2),
  distance_miles DECIMAL(6,2),
  estimated_annual_cost INTEGER,
  transport_score INTEGER,
  computed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accessibility_zip ON accessibility_scores(zip_code);
CREATE INDEX idx_accessibility_score ON accessibility_scores(accessibility_score);
```

## Phase 3: AI Community Golf Agent (Hours 3.5-5.5)

### AI Agent Service with Function Calling
**File:** `src/modules/ai/ai-agent.service.ts`
```typescript
import { generateText } from 'ai';
import { openai } from 'ai/openai';

interface AgentContext {
  userId?: string;
  userLocation: { lat: number; lng: number };
  conversationHistory: Message[];
  userProfile?: {
    experienceLevel: string;
    budget: number;
    age: number;
    hasEquipment: boolean;
    hasTransportation: boolean;
  };
}

@Injectable()
export class AIAgentService {
  constructor(
    private coursesService: CoursesService,
    private communityService: CommunityService,
    private demographicsService: DemographicsService,
    private communityToolsService: CommunityToolsService
  ) {}

  async processAgentQuery(query: string, context: AgentContext): Promise<AgentResponse> {
    const tools = this.getAvailableTools();
    
    const response = await generateText({
      model: openai('gpt-4'),
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt()
        },
        ...context.conversationHistory,
        {
          role: 'user',
          content: query
        }
      ],
      tools,
      toolChoice: 'auto',
      maxToolRoundtrips: 3
    });

    return this.formatAgentResponse(response, context);
  }

  private getAvailableTools() {
    return {
      searchCourses: {
        description: 'Find golf courses based on location, budget, and difficulty',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
            budget: { type: 'number' },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            radius: { type: 'number', default: 25 }
          },
          required: ['location']
        },
        execute: async (params) => this.coursesService.searchWithFilters(params)
      },
      
      getAccessibilityScore: {
        description: 'Get golf accessibility score for a specific location',
        parameters: {
          type: 'object',
          properties: {
            zipCode: { type: 'string' },
            lat: { type: 'number' },
            lng: { type: 'number' }
          }
        },
        execute: async (params) => this.demographicsService.getAccessibilityScore(params)
      },
      
      findYouthPrograms: {
        description: 'Find youth golf programs in an area',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
            ageRange: { type: 'array', items: { type: 'number' } },
            budget: { type: 'number' }
          },
          required: ['location']
        },
        execute: async (params) => this.communityService.findYouthPrograms(params)
      },
      
      findPlayingPartners: {
        description: 'Find other golfers looking to play at specific courses/times',
        parameters: {
          type: 'object',
          properties: {
            courseId: { type: 'string' },
            date: { type: 'string' },
            skillLevel: { type: 'string' },
            maxDistance: { type: 'number', default: 25 }
          }
        },
        execute: async (params) => this.communityService.findPlayingPartners(params)
      },
      
      createGolfGroup: {
        description: 'Create a new golf group for a specific course and time',
        parameters: {
          type: 'object',
          properties: {
            courseId: { type: 'string' },
            date: { type: 'string' },
            time: { type: 'string' },
            maxPlayers: { type: 'number', default: 4 },
            skillLevel: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['courseId', 'date', 'time']
        },
        execute: async (params) => this.communityService.createGolfGroup(params)
      },
      
      findMentorsInArea: {
        description: 'Find golf mentors or coaches in the area',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
            experienceLevel: { type: 'string' },
            budget: { type: 'number' },
            radius: { type: 'number', default: 20 }
          },
          required: ['location']
        },
        execute: async (params) => this.communityService.findMentors(params)
      },
      
      calculateTravelOptions: {
        description: 'Calculate travel options and time between locations',
        parameters: {
          type: 'object',
          properties: {
            from: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
            to: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
            transportModes: { type: 'array', items: { type: 'string' } }
          },
          required: ['from', 'to']
        },
        execute: async (params) => this.communityToolsService.calculateTravelOptions(params)
      },
      
      getEquipmentListings: {
        description: 'Find golf equipment for sale or donation in the area',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
            equipmentType: { type: 'string' },
            budget: { type: 'number' },
            condition: { type: 'string' }
          },
          required: ['location']
        },
        execute: async (params) => this.communityService.getEquipmentListings(params)
      }
    };
  }

  private getSystemPrompt(): string {
    return `
You are a knowledgeable Golf Community Coach for South Florida. Your role is to:

1. Help users create personalized learning paths for golf using local resources
2. Connect people with others in the golf community (playing partners, mentors, groups)
3. Answer questions about getting better at golf with location-specific advice
4. Consider income accessibility and transportation barriers

Key Principles:
- Always use the available tools to get real, current data
- Ask clarifying questions to understand user needs better
- Focus on community connections and accessibility
- Be specific about locations, pricing, and practical details
- Suggest concrete next steps and connections

When helping beginners:
- Start with accessibility (do they have equipment, transportation, budget?)
- Recommend progression: lessons → practice → playing with others
- Connect them to youth programs or beginner groups when appropriate

When connecting people:
- Match skill levels appropriately
- Consider location and transportation
- Create or suggest groups when individual partners aren't available

Always be encouraging while being realistic about costs and time commitments.
`;
  }

  private formatAgentResponse(response: any, context: AgentContext): AgentResponse {
    // Extract tool calls and results
    // Format response for frontend consumption
    // Include map highlights for mentioned locations
    return {
      message: response.text,
      toolInvocations: response.toolInvocations || [],
      mapHighlights: this.extractMapHighlights(response),
      followUpQuestions: this.generateFollowUpQuestions(response.text)
    };
  }
}
```

### Community Service for Social Features
**File:** `src/modules/community/community.service.ts`
```typescript
@Injectable()
export class CommunityService {
  constructor(private supabase: SupabaseClient) {}
  
  async findPlayingPartners(params: {
    courseId: string;
    date: string;
    skillLevel: string;
    maxDistance: number;
  }): Promise<PlayingPartner[]> {
    
    const { courseId, date, skillLevel, maxDistance } = params;
    
    // Find existing groups or individuals looking for partners
    const existingGroups = await this.supabase
      .from('golf_groups')
      .select(`
        *,
        golf_group_members(
          count,
          users(name, golf_experience)
        ),
        courses(name, address)
      `)
      .eq('course_id', courseId)
      .eq('scheduled_date', date)
      .lt('current_members', 'max_members')
      .eq('skill_level', skillLevel);
    
    // Also find individuals seeking partners
    const individuals = await this.supabase
      .from('partner_requests')
      .select(`
        *,
        users(name, golf_experience, location_lat, location_lng)
      `)
      .eq('course_id', courseId)
      .eq('preferred_date', date)
      .eq('skill_level', skillLevel)
      .eq('status', 'active');
    
    return this.formatPartnerResults(existingGroups.data, individuals.data);
  }
  
  async createGolfGroup(params: {
    courseId: string;
    date: string;
    time: string;
    maxPlayers: number;
    skillLevel: string;
    description: string;
  }): Promise<GolfGroup> {
    
    const group = await this.supabase
      .from('golf_groups')
      .insert({
        course_id: params.courseId,
        scheduled_date: params.date,
        scheduled_time: params.time,
        max_members: params.maxPlayers,
        skill_level: params.skillLevel,
        description: params.description,
        current_members: 1,
        status: 'open'
      })
      .select()
      .single();
    
    return group.data;
  }
  
  async findYouthPrograms(params: {
    location: { lat: number; lng: number };
    ageRange: number[];
    budget: number;
  }): Promise<YouthProgram[]> {
    
    const programs = await this.supabase
      .rpc('find_youth_programs_nearby', {
        user_lat: params.location.lat,
        user_lng: params.location.lng,
        max_distance: 25,
        max_cost: params.budget,
        min_age: Math.min(...params.ageRange),
        max_age: Math.max(...params.ageRange)
      });
    
    return programs.data || [];
  }
  
  async findMentors(params: {
    location: { lat: number; lng: number };
    experienceLevel: string;
    budget: number;
    radius: number;
  }): Promise<Mentor[]> {
    
    const mentors = await this.supabase
      .from('mentors')
      .select(`
        *,
        users(name, golf_experience, bio),
        mentor_specialties(specialty)
      `)
      .eq('available', true)
      .lte('hourly_rate', params.budget)
      .rpc('within_radius', {
        lat: params.location.lat,
        lng: params.location.lng,
        radius_miles: params.radius
      });
    
    return mentors.data || [];
  }
  
  async getEquipmentListings(params: {
    location: { lat: number; lng: number };
    equipmentType: string;
    budget: number;
    condition: string;
  }): Promise<EquipmentListing[]> {
    
    let query = this.supabase
      .from('equipment')
      .select(`
        *,
        users(name, location_lat, location_lng)
      `)
      .eq('status', 'available')
      .lte('price', params.budget);
    
    if (params.equipmentType) {
      query = query.eq('equipment_type', params.equipmentType);
    }
    
    if (params.condition) {
      query = query.eq('condition', params.condition);
    }
    
    const { data } = await query.rpc('nearby_equipment', {
      user_lat: params.location.lat,
      user_lng: params.location.lng,
      max_distance: 25
    });
    
    return data || [];
  }
}
```

### Community Tools Service
**File:** `src/modules/ai/community-tools.service.ts`
```typescript
@Injectable()
export class CommunityToolsService {
  
  async calculateTravelOptions(params: {
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    transportModes: string[];
  }): Promise<TravelOption[]> {
    
    const options: TravelOption[] = [];
    
    // Calculate driving distance and time
    if (params.transportModes.includes('driving')) {
      const drivingOption = await this.calculateDrivingRoute(params.from, params.to);
      options.push(drivingOption);
    }
    
    // Calculate public transit options
    if (params.transportModes.includes('transit')) {
      const transitOption = await this.calculateTransitRoute(params.from, params.to);
      options.push(transitOption);
    }
    
    // Calculate walking/biking if distance is reasonable
    const distance = this.calculateDistance(params.from, params.to);
    if (distance <= 5 && params.transportModes.includes('walking')) {
      const walkingOption = await this.calculateWalkingRoute(params.from, params.to);
      options.push(walkingOption);
    }
    
    return options;
  }
  
  private calculateDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
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
}
```

## Database Schema for Community Features

### Core Community Tables
```sql
-- Golf groups for community play
CREATE TABLE golf_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  created_by UUID REFERENCES users(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  max_members INTEGER DEFAULT 4,
  current_members INTEGER DEFAULT 1,
  skill_level VARCHAR(20),
  description TEXT,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Golf group memberships
CREATE TABLE golf_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES golf_groups(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'confirmed'
);

-- Partner requests for individual matching
CREATE TABLE partner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  preferred_date DATE,
  preferred_time TIME,
  skill_level VARCHAR(20),
  message TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Youth programs directory
CREATE TABLE youth_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  organization VARCHAR, -- First Tee, PGA Junior League, etc.
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address TEXT,
  age_min INTEGER,
  age_max INTEGER,
  cost_per_session DECIMAL(6,2),
  schedule_days VARCHAR[], -- ['monday', 'wednesday', 'saturday']
  contact_info JSONB,
  description TEXT,
  equipment_provided BOOLEAN DEFAULT FALSE,
  transportation_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mentors and coaches
CREATE TABLE mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  bio TEXT,
  experience_years INTEGER,
  hourly_rate DECIMAL(6,2),
  available BOOLEAN DEFAULT TRUE,
  specialties VARCHAR[], -- ['beginners', 'youth', 'advanced', 'putting']
  certifications VARCHAR[],
  location_radius INTEGER DEFAULT 25, -- miles willing to travel
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Spatial Functions for Location Queries
```sql
-- Function to find nearby youth programs
CREATE OR REPLACE FUNCTION find_youth_programs_nearby(
  user_lat DECIMAL(10,8),
  user_lng DECIMAL(11,8),
  max_distance INTEGER,
  max_cost DECIMAL(6,2),
  min_age INTEGER,
  max_age INTEGER
) RETURNS TABLE (
  id UUID,
  name VARCHAR,
  organization VARCHAR,
  distance_miles DECIMAL(6,2),
  cost_per_session DECIMAL(6,2),
  age_range TEXT,
  description TEXT,
  contact_info JSONB
) LANGUAGE sql STABLE AS $$
  SELECT 
    yp.id,
    yp.name,
    yp.organization,
    ROUND(
      (3959 * acos(
        cos(radians(user_lat)) * cos(radians(yp.location_lat)) *
        cos(radians(yp.location_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(yp.location_lat))
      ))::numeric, 2
    ) as distance_miles,
    yp.cost_per_session,
    CONCAT(yp.age_min, '-', yp.age_max, ' years') as age_range,
    yp.description,
    yp.contact_info
  FROM youth_programs yp
  WHERE yp.cost_per_session <= max_cost
    AND yp.age_min <= max_age
    AND yp.age_max >= min_age
    AND (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(yp.location_lat)) *
        cos(radians(yp.location_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(yp.location_lat))
      )
    ) <= max_distance
  ORDER BY distance_miles;
$$;

-- Function to find nearby equipment
CREATE OR REPLACE FUNCTION nearby_equipment(
  user_lat DECIMAL(10,8),
  user_lng DECIMAL(11,8),
  max_distance INTEGER
) RETURNS TABLE (
  id UUID,
  title VARCHAR,
  equipment_type VARCHAR,
  condition VARCHAR,
  price INTEGER,
  distance_miles DECIMAL(6,2),
  seller_name VARCHAR
) LANGUAGE sql STABLE AS $$
  SELECT 
    e.id,
    e.title,
    e.equipment_type,
    e.condition,
    e.price,
    ROUND(
      (3959 * acos(
        cos(radians(user_lat)) * cos(radians(e.location_lat)) *
        cos(radians(e.location_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(e.location_lat))
      ))::numeric, 2
    ) as distance_miles,
    u.name as seller_name
  FROM equipment e
  JOIN users u ON e.user_id = u.id
  WHERE e.status = 'available'
    AND (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(e.location_lat)) *
        cos(radians(e.location_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(e.location_lat))
      )
    ) <= max_distance
  ORDER BY distance_miles;
$$;
```

## Phase 4: API Controllers and Integration (Hours 5.5-7)

### AI Agent Controller
**File:** `src/modules/ai/ai.controller.ts`
```typescript
@Controller('ai')
export class AIController {
  constructor(private aiAgentService: AIAgentService) {}

  @Post('query')
  async processAgentQuery(@Body() request: AgentQueryRequest) {
    try {
      const response = await this.aiAgentService.processAgentQuery(
        request.query,
        {
          userId: request.userId,
          userLocation: request.userLocation,
          conversationHistory: request.conversationHistory || [],
          userProfile: request.userProfile
        }
      );
      
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process query',
        fallbackMessage: 'I\'m having trouble right now. Can you try asking in a different way?'
      };
    }
  }

  @Post('seed-community-data')
  async seedCommunityData() {
    // Seed youth programs, mentors, and community data
    const programs = await this.seedYouthPrograms();
    const mentors = await this.seedMentors();
    
    return {
      youthProgramsSeeded: programs.length,
      mentorsSeeded: mentors.length
    };
  }

  private async seedYouthPrograms() {
    const programs = [
      {
        name: 'First Tee Miami',
        organization: 'First Tee',
        location_lat: 25.7617,
        location_lng: -80.1918,
        address: '6801 Miami Lakes Dr, Miami Lakes, FL 33014',
        age_min: 5,
        age_max: 17,
        cost_per_session: 0,
        schedule_days: ['saturday', 'sunday'],
        description: 'Free youth golf program focusing on character development',
        equipment_provided: true,
        transportation_available: false
      },
      // Add more programs...
    ];

    const { data } = await this.supabase
      .from('youth_programs')
      .insert(programs)
      .select();

    return data;
  }
}
```

### Community Controller
**File:** `src/modules/community/community.controller.ts`
```typescript
@Controller('community')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @Post('playing-partners')
  async findPlayingPartners(@Body() request: FindPartnersRequest) {
    return this.communityService.findPlayingPartners(request);
  }

  @Post('groups')
  async createGolfGroup(@Body() request: CreateGroupRequest) {
    return this.communityService.createGolfGroup(request);
  }

  @Post('groups/:groupId/join')
  async joinGolfGroup(@Param('groupId') groupId: string, @Body() request: JoinGroupRequest) {
    return this.communityService.joinGolfGroup(groupId, request.userId);
  }

  @Post('youth-programs')
  async findYouthPrograms(@Body() request: FindYouthProgramsRequest) {
    return this.communityService.findYouthPrograms(request);
  }

  @Post('mentors')
  async findMentors(@Body() request: FindMentorsRequest) {
    return this.communityService.findMentors(request);
  }

  @Post('mentors/:mentorId/contact')
  async contactMentor(@Param('mentorId') mentorId: string, @Body() request: ContactMentorRequest) {
    return this.communityService.contactMentor(mentorId, request);
  }

  @Get('equipment')
  async getEquipmentListings(@Query() query: EquipmentQuery) {
    return this.communityService.getEquipmentListings(query);
  }
}
```

## API Documentation

### AI Agent Endpoints
```typescript
// POST /api/ai/query
Request: {
  query: string,
  userLocation: { lat: number, lng: number },
  conversationHistory?: Message[],
  userProfile?: {
    experienceLevel: string,
    budget: number,
    age: number,
    hasEquipment: boolean,
    hasTransportation: boolean
  }
}
Response: {
  success: boolean,
  message: string,
  toolInvocations?: {
    toolName: string,
    toolCallId: string,
    args: any,
    result: any
  }[],
  mapHighlights?: {
    courseId: string,
    lat: number,
    lng: number,
    type: 'course' | 'program' | 'mentor'
  }[],
  followUpQuestions?: string[]
}
```

### Community Endpoints
```typescript
// POST /api/community/playing-partners
Request: {
  courseId: string,
  date: string,
  skillLevel: string,
  maxDistance?: number
}
Response: {
  groups: GolfGroup[],
  individuals: PartnerRequest[]
}

// POST /api/community/youth-programs
Request: {
  location: { lat: number, lng: number },
  ageRange: number[],
  budget: number
}
Response: YouthProgram[]

// POST /api/community/mentors
Request: {
  location: { lat: number, lng: number },
  experienceLevel: string,
  budget: number,
  radius?: number
}
Response: Mentor[]
```

### Demographics Endpoints
```typescript
// GET /api/demographics/heatmap
Response: Array<{
  zipCode: string,
  medianIncome: number,
  bounds: GeoJSON.Polygon,
  accessibilityScore: number
}>

// GET /api/demographics/accessibility-score/:lat/:lng
Response: {
  accessibilityScore: number,
  nearestAffordableCourse: Course,
  estimatedAnnualCost: number,
  transportationOptions: string[]
}
```

## Data Seeding Strategy

### Course Data Requirements
- 30+ verified South Florida golf courses
- Complete address and pricing information
- Difficulty ratings and amenity flags
- Youth program availability
- Equipment rental options

### Community Data Seeding
- First Tee chapter locations and schedules
- PGA Junior League programs
- Municipal youth golf programs
- Sample mentors and coaches
- Equipment listings for marketplace

### Demographic Data Coverage
- All zip codes in Miami-Dade (33xxx)
- All zip codes in Broward (33xxx) 
- All zip codes in Palm Beach (33xxx)
- Median household income from 2022 Census
- Population density data

## Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
CENSUS_API_KEY=xxx
OPENAI_API_KEY=sk-xxx
MAPBOX_API_KEY=xxx
JWT_SECRET=xxx
PORT=3001
```

## Testing Strategy
- Unit tests for recommendation algorithms
- Integration tests for API endpoints
- Load testing for AI agent system
- Data validation tests for Census integration
- Mock external API calls for reliability

## Performance Optimization
- Cache frequently accessed demographic data
- Index spatial queries for location-based searches
- Implement connection pooling for database
- Rate limiting for AI agent endpoints
- Background processing for accessibility score calculations