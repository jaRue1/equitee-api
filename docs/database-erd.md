# EquiTee Database ERD

## Current Database Schema (Supabase)

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR email UK
        VARCHAR name
        VARCHAR phone
        ENUM user_type "parent|youth|mentor|sponsor"
        DECIMAL location_lat
        DECIMAL location_lng
        VARCHAR zip_code
        ENUM golf_experience "beginner|intermediate|advanced|pro"
        INTEGER handicap
        INTEGER age "1-120"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    courses {
        UUID id PK
        VARCHAR name
        VARCHAR address
        DECIMAL lat
        DECIMAL lng
        INTEGER green_fee_min
        INTEGER green_fee_max
        BOOLEAN youth_programs
        INTEGER difficulty_rating "1-5"
        BOOLEAN equipment_rental
        JSONB contact_info
        VARCHAR website
        TIMESTAMP created_at
    }

    equipment {
        UUID id PK
        UUID user_id FK
        VARCHAR title
        TEXT description
        ENUM equipment_type "driver|woods|irons|wedges|putter|bag"
        ENUM condition "new|excellent|good|fair"
        VARCHAR age_range
        INTEGER price
        VARCHAR[] images
        ENUM status "available|pending|donated|sold"
        DECIMAL location_lat
        DECIMAL location_lng
        TIMESTAMP created_at
    }

    demographics {
        UUID id PK
        VARCHAR zip_code UK
        INTEGER median_income
        INTEGER population
        VARCHAR county "Miami-Dade|Broward|Palm Beach"
        TIMESTAMP created_at
    }

    youth_programs {
        UUID id PK
        VARCHAR name
        VARCHAR organization
        DECIMAL location_lat
        DECIMAL location_lng
        TEXT address
        INTEGER age_min
        INTEGER age_max
        DECIMAL cost_per_session
        VARCHAR[] schedule_days
        TEXT description
        BOOLEAN equipment_provided
        BOOLEAN transportation_available
        JSONB contact_info
        TIMESTAMP created_at
    }

    mentors {
        UUID id PK
        UUID user_id FK
        TEXT bio
        INTEGER experience_years
        DECIMAL hourly_rate
        BOOLEAN available
        VARCHAR[] specialties
        VARCHAR[] certifications
        INTEGER location_radius
        JSONB contact_info
        TIMESTAMP created_at
    }

    golf_groups {
        UUID id PK
        UUID course_id FK
        UUID created_by FK
        DATE scheduled_date
        TIME scheduled_time
        INTEGER max_members
        INTEGER current_members
        VARCHAR skill_level
        TEXT description
        VARCHAR status
        TIMESTAMP created_at
    }

    golf_group_members {
        UUID id PK
        UUID group_id FK
        UUID user_id FK
        TIMESTAMP joined_at
        VARCHAR status
    }

    partner_requests {
        UUID id PK
        UUID user_id FK
        UUID course_id FK
        DATE preferred_date
        TIME preferred_time
        VARCHAR skill_level
        TEXT message
        VARCHAR status
        TIMESTAMP created_at
    }

    accessibility_scores {
        UUID id PK
        VARCHAR zip_code
        UUID course_id FK
        DECIMAL accessibility_score
        DECIMAL distance_miles
        INTEGER estimated_annual_cost
        INTEGER transport_score
        TIMESTAMP computed_at
    }

    chat_conversations {
        UUID id PK
        UUID user_id FK
        JSONB conversation_state
        VARCHAR current_step
        JSONB user_location
        VARCHAR mode
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    chat_messages {
        UUID id PK
        UUID conversation_id FK
        VARCHAR sender
        TEXT message
        VARCHAR message_type
        JSONB metadata
        TIMESTAMP created_at
    }

    %% Foreign Key Relationships (Enforced in Supabase)
    users ||--o{ equipment : "user_id"
    users ||--o{ mentors : "user_id"
    users ||--o{ golf_groups : "created_by"
    users ||--o{ golf_group_members : "user_id"
    users ||--o{ partner_requests : "user_id"
    users ||--o{ chat_conversations : "user_id"

    courses ||--o{ golf_groups : "course_id"
    courses ||--o{ partner_requests : "course_id"
    courses ||--o{ accessibility_scores : "course_id"

    golf_groups ||--o{ golf_group_members : "group_id"
    chat_conversations ||--o{ chat_messages : "conversation_id"

    %% Logical Relationships (Not enforced FKs)
    users }o--o{ demographics : "zip_code lookup"
    demographics ||--o{ accessibility_scores : "zip_code"
    mentors }|..|{ youth_programs : "can_coach"
```

## Table Descriptions

### Core Tables (Existing)
- **users**: Core user accounts for all platform participants
- **courses**: Golf courses in South Florida with pricing and amenities
- **equipment**: Golf equipment marketplace (buy/sell/donate)

### Data Tables (Added via Migrations)
- **demographics**: US Census data by ZIP code for accessibility analysis
- **youth_programs**: Youth golf programs (First Tee, municipal, etc.)
- **mentors**: Golf instructors and coaches linked to user accounts

### Community Features (Day 2 Spec)
- **golf_groups**: Organized golf groups for scheduled rounds
- **golf_group_members**: Members in each golf group
- **partner_requests**: Users seeking golf partners at specific courses
- **accessibility_scores**: Computed accessibility data for heat map

### AI Chat System
- **chat_conversations**: User chat sessions with AI golf coach
- **chat_messages**: Individual messages within conversations

## Key Relationships

1. **users** → **equipment, mentors, golf_groups, partner_requests, chat_conversations**: One user can have multiple of each
2. **courses** → **golf_groups, partner_requests, accessibility_scores**: Courses are central to community and analysis features
3. **golf_groups** → **golf_group_members**: Group membership tracking
4. **chat_conversations** → **chat_messages**: Message history within conversations
5. **demographics** → **accessibility_scores**: Census data drives accessibility calculations

## Current Data Counts

- **Demographics**: 143 ZIP codes with real Census data (loaded)
- **Youth Programs**: 6 verified programs in South Florida (loaded)
- **Mentors**: 13 verified PGA pros and First Tee coaches (loaded)
- **Users**: Existing user base + 13 mentor accounts
- **Courses**: Existing golf course data
- **Equipment**: Existing equipment listings
- **Community Tables**: Ready for implementation
- **Chat Tables**: Ready for AI agent development

## Data Sources

- **Demographics**: US Census Bureau 2022 ACS (real data)
- **Youth Programs**: First Tee, municipal programs (verified)
- **Mentors**: PGA professionals, First Tee coaches (verified)

## Migration Status ✅

All database migrations completed successfully:
- ✅ **001_create_core_tables.sql**: Community and chat tables created
- ✅ **002_create_indexes.sql**: Performance indexes applied
- ✅ **003_seed_demographics_data.sql**: 143 ZIP codes loaded
- ✅ **004_seed_youth_programs.sql**: 6 programs loaded
- ✅ **005_seed_mentors.sql**: 13 mentors loaded
- ✅ **006_create_spatial_functions.sql**: Location functions ready

## Available Spatial Functions

- `find_youth_programs_nearby(lat, lng, max_distance, max_cost, min_age, max_age)`
- `find_mentors_nearby(lat, lng, max_distance, max_hourly_rate)`
- `find_courses_nearby(lat, lng, max_distance, max_green_fee, youth_programs_only)`
- `find_equipment_nearby(lat, lng, max_distance, max_price, equipment_type_filter)`

## Ready for API Development

Database is fully prepared for:
1. **Community Features**: Golf groups, partner matching
2. **AI Chat Agent**: Conversation management with spatial queries
3. **Accessibility Analysis**: Demographics + course data computation
4. **Mentor Matching**: Real professional data with location filtering