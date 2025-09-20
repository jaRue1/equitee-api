# EquiTee - Democratizing Golf Access in South Florida

## Project Overview
EquiTee connects youth in underserved South Florida communities to golf opportunities, equipment, and mentorship through an AI-powered platform that maps accessibility gaps and facilitates community connections.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL JS
- **Auth**: Google OAuth
- **Deployment**: Vercel (frontend) + Railway (backend)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  user_type VARCHAR CHECK (user_type IN ('parent', 'youth', 'mentor', 'sponsor')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  zip_code VARCHAR(10),
  golf_experience VARCHAR CHECK (golf_experience IN ('beginner', 'intermediate', 'advanced', 'pro')),
  handicap INTEGER,
  age INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  green_fee_min INTEGER,
  green_fee_max INTEGER,
  youth_programs BOOLEAN DEFAULT FALSE,
  difficulty_rating DECIMAL(2,1) CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  equipment_rental BOOLEAN DEFAULT FALSE,
  contact_info JSONB,
  website VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Equipment Table
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  equipment_type VARCHAR CHECK (equipment_type IN ('driver', 'woods', 'irons', 'wedges', 'putter', 'bag')),
  condition VARCHAR CHECK (condition IN ('new', 'excellent', 'good', 'fair')),
  age_range VARCHAR,
  price INTEGER,
  images TEXT[],
  status VARCHAR CHECK (status IN ('available', 'pending', 'donated', 'sold')) DEFAULT 'available',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- `POST /auth/google` - Google OAuth login
- `POST /auth/register` - Complete registration after OAuth
- `GET /auth/profile` - Get current user profile

### Courses
- `GET /courses` - Get courses with filters (lat, lng, radius, price, youth_programs)
- `GET /courses/:id` - Get detailed course information
- `POST /courses/search` - Advanced search with multiple filters

### Equipment
- `GET /equipment` - Get equipment listings with filters
- `POST /equipment` - Create new equipment listing
- `PUT /equipment/:id/claim` - Claim/purchase equipment
- `GET /equipment/recommendations` - Get personalized equipment recommendations

### Users
- `GET /users/recommendations` - Get personalized course/program recommendations
- `PUT /users/profile` - Update user profile

## Frontend Pages & Components

### Pages
- `/` - Landing page with interactive map
- `/onboarding` - Registration wizard (self vs child)
- `/equipment` - Equipment marketplace
- `/courses` - Course directory with filters
- `/profile` - User dashboard
- `/courses/[id]` - Individual course detail page

### Key Components
- `InteractiveMap` - Mapbox integration with course markers
- `CourseDrawer` - Slide-out course details panel
- `EquipmentCard` - Equipment listing component
- `OnboardingWizard` - Multi-step registration flow
- `RecommendationEngine` - Personalized suggestions

## Development Sprint Plan (24 Hours)

### Phase 1: Infrastructure (0-2 hours)
**Person A (Frontend):**
- Initialize Next.js project with TypeScript + Tailwind
- Set up basic routing and layout components
- Configure Mapbox environment variables

**Person B (Backend):**
- Initialize NestJS project
- Set up Supabase connection and database schema
- Configure Google OAuth

### Phase 2: Core Features (2-12 hours)
**Person A:**
- Build onboarding flow with "self vs child" registration
- Integrate Mapbox with course markers and clustering
- Create course detail drawer component
- Implement equipment marketplace UI

**Person B:**
- Build CRUD endpoints for all entities
- Seed database with 30+ real South Florida courses
- Create 50+ equipment listings with stock images
- Implement recommendation algorithm (location + experience filtering)

### Phase 3: Integration & Polish (12-20 hours)
**Person A:**
- Add distance calculations and route visualization
- Implement equipment claiming/messaging flow
- Mobile responsiveness and UI polish
- Connect all frontend components to backend APIs

**Person B:**
- Build equipment claiming system
- Implement user messaging for equipment trades
- Set up image upload handling
- Deploy backend to Railway

### Phase 4: Demo Prep (20-24 hours)
**Both:**
- Deploy frontend to Vercel
- End-to-end testing of demo flow
- Create presentation using GenSpark (2 free generations)
- Practice demo sequence and prepare talking points

## Demo Flow
1. **Hook**: Show map with golf accessibility gaps in South Florida
2. **User Registration**: Live demo of onboarding wizard
3. **Course Discovery**: Interactive map navigation with course details
4. **Equipment Marketplace**: Show equipment trading/donation system
5. **Community Impact**: Display metrics and partnership potential

## Data Seeding Strategy
- **Manual curation**: 30 verified South Florida courses with accurate data
- **Equipment listings**: Mix of stock photos and real marketplace data
- **User profiles**: Realistic test accounts across all user types
- **Location data**: Focus on Miami-Dade, Broward, and Palm Beach counties

## Presentation Tools
- **GenSpark**: AI-powered presentation generation (2 free generations)
- **Figma**: Quick mockups if needed
- **Loom**: Record demo backup video as fallback

## Environment Variables
```env
# Frontend (.env.local)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=

# Backend (.env)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
JWT_SECRET=
```

## Success Metrics for Judges
- **Innovation**: First golf accessibility platform for South Florida youth
- **Community Impact**: Clear path to democratizing golf access
- **Technical Excellence**: Smooth 3D map interaction, real-time recommendations
- **Business Viability**: Course partnership pipeline and sponsorship model
- **Presentation**: Personal story + live demo + clear value proposition%