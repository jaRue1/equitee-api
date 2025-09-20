# EquiTee Backend Development Specification

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
│   │   ├── ai.service.ts
│   │   ├── embeddings.service.ts
│   │   └── vector.service.ts
│   ├── courses/
│   │   ├── courses.module.ts
│   │   ├── courses.controller.ts
│   │   ├── courses.service.ts
│   │   └── entities/
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

### AI Chat Endpoint Setup (Phase 1 - Basic Branching)
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
    
    // Phase 2 (Stretch Goal): Handle AI consultant queries
    if (state.mode === 'ai_consultant') {
      return this.aiService.processNaturalLanguageQuery(userResponse, state.userLocation);
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

## Phase 3: AI Golf Consultant (Stretch Goal - Hours 5.5-7)

### RAG System Implementation
**File:** `src/modules/ai/ai.service.ts`
```typescript
@Injectable()
export class AIService {
  constructor(
    private embeddingsService: EmbeddingsService,
    private vectorService: VectorService,
    private coursesService: CoursesService
  ) {}
  
  async processNaturalLanguageQuery(
    question: string, 
    userLocation: { lat: number; lng: number }
  ): Promise<AIResponse> {
    
    // 1. Generate embedding for user question
    const questionEmbedding = await this.embeddingsService.createEmbedding(question);
    
    // 2. Semantic search through vectorized golf knowledge
    const relevantDocuments = await this.vectorService.similaritySearch(
      questionEmbedding, 
      {
        limit: 5,
        threshold: 0.7,
        location: userLocation // Boost location-relevant results
      }
    );
    
    // 3. Combine results with user location context
    const locationContext = await this.coursesService.findCoursesInRadius(userLocation, 25);
    
    // 4. Generate response using OpenAI with retrieved context
    const response = await this.generateResponse(question, relevantDocuments, locationContext);
    
    // 5. Extract course references for map highlighting
    const mapHighlights = this.extractCourseReferences(response, locationContext);
    
    return {
      answer: response,
      sources: relevantDocuments.map(doc => doc.metadata.course),
      mapHighlights,
      followUpQuestions: this.generateFollowUpQuestions(question)
    };
  }
  
  private async generateResponse(
    question: string, 
    context: Document[], 
    nearbyCorpses: Course[]
  ): Promise<string> {
    const prompt = `
You are a knowledgeable golf consultant for South Florida. Answer the user's question using the provided context about golf courses and programs.

User Question: ${question}

Relevant Golf Information:
${context.map(doc => doc.content).join('\n\n')}

Nearby Courses:
${nearbyCorpses.map(course => `${course.name} - ${course.address} - ${course.greenFeeMin}-${course.greenFeeMax} - Difficulty: ${course.difficultyRating}/5`).join('\n')}

Guidelines:
- Be specific about course names, pricing, and locations
- Consider the user's location when making recommendations
- Mention specific amenities like youth programs or equipment rental when relevant
- Keep responses concise but informative
- If you don't have enough information, say so honestly
`;

    // Call OpenAI API with the constructed prompt
    return this.callOpenAI(prompt);
  }
}
```

### Embeddings Service
**File:** `src/modules/ai/embeddings.service.ts`
```typescript
@Injectable()
export class EmbeddingsService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000) // Token limit safety
    });
    
    return response.data[0].embedding;
  }
  
  async seedKnowledgeBase() {
    // Vectorize course data, golf tips, local information
    const documents = await this.prepareDocumentsForVectorization();
    
    for (const doc of documents) {
      const embedding = await this.createEmbedding(doc.content);
      await this.vectorService.storeEmbedding(doc.id, embedding, doc.metadata);
    }
  }
  
  private async prepareDocumentsForVectorization(): Promise<Document[]> {
    // Combine course data, reviews, golf knowledge
    const courses = await this.coursesService.getAllCoursesWithDetails();
    const golfKnowledge = await this.loadGolfKnowledgeBase();
    
    const documents: Document[] = [];
    
    // Create embeddings for each course
    for (const course of courses) {
      documents.push({
        id: `course_${course.id}`,
        content: `${course.name} is a golf course in ${course.address} with green fees from ${course.greenFeeMin} to ${course.greenFeeMax}. Difficulty rating: ${course.difficultyRating}/5. ${course.youthPrograms ? 'Offers youth programs.' : ''} ${course.equipmentRental ? 'Equipment rental available.' : ''}`,
        metadata: { type: 'course', course, location: { lat: course.lat, lng: course.lng } }
      });
    }
    
    // Add general golf knowledge
    for (const knowledge of golfKnowledge) {
      documents.push({
        id: `knowledge_${knowledge.id}`,
        content: knowledge.content,
        metadata: { type: 'knowledge', category: knowledge.category }
      });
    }
    
    return documents;
  }
}
```

### Vector Search Service
**File:** `src/modules/ai/vector.service.ts`
```typescript
@Injectable()
export class VectorService {
  constructor(private supabase: SupabaseClient) {}
  
  async storeEmbedding(
    documentId: string, 
    embedding: number[], 
    metadata: any
  ): Promise<void> {
    await this.supabase
      .from('embeddings')
      .insert({
        document_id: documentId,
        embedding: embedding,
        metadata: metadata,
        created_at: new Date()
      });
  }
  
  async similaritySearch(
    queryEmbedding: number[], 
    options: {
      limit: number;
      threshold: number;
      location?: { lat: number; lng: number };
    }
  ): Promise<Document[]> {
    
    let query = this.supabase
      .rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: options.threshold,
        match_count: options.limit
      });
    
    // Boost results near user's location
    if (options.location) {
      query = query.rpc('boost_location_relevance', {
        user_lat: options.location.lat,
        user_lng: options.location.lng
      });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(row => ({
      id: row.document_id,
      content: row.content,
      similarity: row.similarity,
      metadata: row.metadata
    }));
  }
}
```

### Database Schema for Embeddings
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table for RAG system
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id VARCHAR NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimension
  metadata JSONB,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for similarity search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function for semantic search
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) RETURNS TABLE (
  document_id varchar,
  content text,
  metadata jsonb,
  similarity float
) LANGUAGE sql STABLE AS $
  SELECT
    document_id,
    content,
    metadata,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM embeddings
  WHERE 1 - (embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY embeddings.embedding <=> query_embedding
  LIMIT match_count;
$;
```

### Recommendation Engine
**File:** `src/modules/chat/recommendation.service.ts`
```typescript
interface UserProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  averageScore?: number;
  budget: number;
  location: { lat: number; lng: number };
  age?: number;
}

@Injectable()
export class RecommendationService {
  
  async generateJourneyPlan(profile: UserProfile): Promise<JourneyPlan> {
    const nearbyResources = await this.findNearbyResources(profile.location);
    
    switch (profile.experienceLevel) {
      case 'beginner':
        return this.createBeginnerJourney(profile, nearbyResources);
      case 'intermediate':
        return this.createIntermediateJourney(profile, nearbyResources);
      case 'advanced':
        return this.createAdvancedJourney(profile, nearbyResources);
    }
  }
  
  private async createBeginnerJourney(profile: UserProfile, resources: NearbyResources): Promise<JourneyPlan> {
    return {
      phase1: {
        title: "Learn the Basics",
        duration: "2-3 weeks",
        activities: [
          {
            type: "driving_range",
            location: resources.drivingRanges[0],
            goal: "Hit 100 balls, focus on contact",
            estimatedCost: 25
          },
          {
            type: "putting_green",
            location: resources.puttingGreens[0],
            goal: "Practice 10-foot putts",
            estimatedCost: 0
          }
        ]
      },
      phase2: {
        title: "First Round",
        duration: "Week 4",
        activities: [
          {
            type: "par3_course",
            location: resources.par3Courses[0],
            goal: "Complete 9 holes",
            estimatedCost: 35
          }
        ]
      },
      totalEstimatedCost: 60,
      milestones: ["First clean contact", "First par", "Complete round under 60"]
    };
  }
}
```

### Milestone Tracking System
**File:** `src/modules/users/progress.service.ts`
```typescript
interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'score' | 'course' | 'social';
  completed: boolean;
  completedAt?: Date;
}

@Injectable()
export class ProgressService {
  
  async recordMilestone(userId: string, milestoneId: string) {
    // Update user's progress
    // Calculate next recommendations
    // Send achievement notification
  }
  
  async getUserProgress(userId: string) {
    // Return current journey phase
    // Completed milestones
    // Next recommended actions
  }
  
  async updateJourneyPlan(userId: string, newSkillLevel: string) {
    // Recalculate recommendations based on progress
    // Adjust difficulty and course suggestions
  }
}
```

### Course Matching Algorithm
**File:** `src/modules/courses/matching.service.ts`
```typescript
@Injectable()
export class CourseMatchingService {
  
  async findOptimalCourses(
    userLocation: { lat: number; lng: number },
    experienceLevel: string,
    budget: number,
    preferences: CoursePreferences
  ): Promise<RankedCourse[]> {
    
    const nearbyCorpses = await this.findCoursesInRadius(userLocation, 25);
    
    return nearbyCorpses
      .filter(course => this.matchesCriteria(course, experienceLevel, budget, preferences))
      .map(course => ({
        ...course,
        matchScore: this.calculateMatchScore(course, userLocation, experienceLevel, budget),
        estimatedCost: this.calculateTotalCost(course, preferences),
        travelTime: this.calculateTravelTime(userLocation, course.location)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }
  
  private calculateMatchScore(
    course: Course,
    userLocation: { lat: number; lng: number },
    experienceLevel: string,
    budget: number
  ): number {
    let score = 100;
    
    // Distance penalty (closer is better)
    const distance = this.calculateDistance(userLocation, course.location);
    score -= Math.min(30, distance * 2);
    
    // Difficulty match (exact match preferred)
    const optimalDifficulty = this.getOptimalDifficulty(experienceLevel);
    const difficultyDiff = Math.abs(course.difficultyRating - optimalDifficulty);
    score -= difficultyDiff * 10;
    
    // Budget compatibility
    if (course.greenFeeMin > budget) score -= 50;
    if (course.greenFeeMax <= budget * 0.7) score += 10; // Well within budget
    
    // Youth programs bonus
    if (course.youthPrograms) score += 15;
    
    // Equipment rental bonus for beginners
    if (experienceLevel === 'beginner' && course.equipmentRental) score += 10;
    
    return Math.max(0, score);
  }
}
```

## Phase 4: Integration & Optimization (Hours 5.5-7)

### API Performance Optimization
**File:** `src/common/interceptors/caching.interceptor.ts`
```typescript
@Injectable()
export class CachingInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.method}:${request.url}`;
    
    // Cache demographic and course data
    if (this.shouldCache(request)) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return of(cached.data);
      }
    }
    
    return next.handle().pipe(
      tap(data => {
        if (this.shouldCache(request)) {
          this.cache.set(cacheKey, { data, timestamp: Date.now() });
        }
      })
    );
  }
}
```

### Database Query Optimization
**File:** `src/modules/courses/courses.service.ts`
```typescript
@Injectable()
export class CoursesService {
  
  async findCoursesWithFilters(filters: CourseFilters): Promise<Course[]> {
    // Use spatial indexing for location queries
    // Optimize joins for related data
    // Implement pagination for large result sets
    
    let query = this.supabase
      .from('courses')
      .select(`
        *,
        accessibility_scores(accessibility_score),
        equipment(count)
      `);
    
    if (filters.location && filters.radius) {
      // PostGIS spatial query for better performance
      query = query.rpc('courses_within_radius', {
        lat: filters.location.lat,
        lng: filters.location.lng,
        radius_miles: filters.radius
      });
    }
    
    if (filters.priceRange) {
      query = query.gte('green_fee_min', filters.priceRange[0])
                   .lte('green_fee_max', filters.priceRange[1]);
    }
    
    return query.limit(50);
  }
}
```

### Error Handling & Validation
**File:** `src/common/dto/validation.dto.ts`
```typescript
export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;
  
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;
}

export class ChatResponseDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;
  
  @IsString()
  @IsNotEmpty()
  message: string;
  
  @ValidateNested()
  @Type(() => LocationDto)
  userLocation: LocationDto;
}
```

## API Documentation

### Chat Endpoints
```typescript
// POST /api/chat/start
Request: { userLocation: { lat: number, lng: number } }
Response: {
  conversationId: string,
  message: string,
  options: string[]
}

// POST /api/chat/respond  
Request: {
  conversationId: string,
  message: string,
  userLocation: { lat: number, lng: number }
}
Response: {
  message: string,
  recommendations?: CourseRecommendation[],
  mapHighlights?: { lat: number, lng: number, type: string }[],
  options?: string[],
  completed: boolean
}
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

## Environment Variables
```env
DATABASE_URL=postgresql://user:pass@host:port/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
CENSUS_API_KEY=xxx
MAPBOX_API_KEY=xxx
JWT_SECRET=xxx
REDIS_URL=redis://localhost:6379
```

## Data Seeds

### Course Data Requirements
- 30+ verified South Florida golf courses
- Complete address and pricing information
- Difficulty ratings and amenity flags
- Youth program availability
- Equipment rental options

### Demographic Data Coverage
- All zip codes in Miami-Dade (33xxx)
- All zip codes in Broward (33xxx) 
- All zip codes in Palm Beach (33xxx)
- Median household income from 2022 Census
- Population density data

## Testing Strategy
- Unit tests for recommendation algorithms
- Integration tests for API endpoints
- Load testing for chat system
- Data validation tests for Census integration
- Mock external API calls for reliability