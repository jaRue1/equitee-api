-- Migration 001: Create Core Tables
-- Creates all essential tables for EquiTee platform
-- Run first - establishes foundation

-- Demographics table (for accessibility analysis)
CREATE TABLE IF NOT EXISTS demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(5) NOT NULL UNIQUE,
  median_income INTEGER NOT NULL,
  population INTEGER,
  county VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Youth programs table
CREATE TABLE IF NOT EXISTS youth_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  organization VARCHAR,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address TEXT,
  age_min INTEGER,
  age_max INTEGER,
  cost_per_session DECIMAL(6,2),
  schedule_days VARCHAR[],
  description TEXT,
  equipment_provided BOOLEAN DEFAULT FALSE,
  transportation_available BOOLEAN DEFAULT FALSE,
  contact_info JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mentors table (extends users)
CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  experience_years INTEGER,
  hourly_rate DECIMAL(6,2),
  available BOOLEAN DEFAULT TRUE,
  specialties VARCHAR[],
  certifications VARCHAR[],
  location_radius INTEGER DEFAULT 25,
  contact_info JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community features tables (from Day 2 spec)
CREATE TABLE IF NOT EXISTS golf_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  max_members INTEGER DEFAULT 4,
  current_members INTEGER DEFAULT 1,
  skill_level VARCHAR(20),
  description TEXT,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS golf_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES golf_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'confirmed'
);

CREATE TABLE IF NOT EXISTS partner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  preferred_date DATE,
  preferred_time TIME,
  skill_level VARCHAR(20),
  message TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Accessibility scores (computed data for heat map)
CREATE TABLE IF NOT EXISTS accessibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code VARCHAR(5) NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  accessibility_score DECIMAL(5,2),
  distance_miles DECIMAL(6,2),
  estimated_annual_cost INTEGER,
  transport_score INTEGER,
  computed_at TIMESTAMP DEFAULT NOW()
);

-- Chat conversations (for AI coach feature)
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_state JSONB,
  current_step VARCHAR(50),
  user_location JSONB,
  mode VARCHAR(20) DEFAULT 'onboarding',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL, -- 'user' or 'ai'
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure equipment table has proper FK (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'equipment'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name = 'equipment_user_id_fkey'
  ) THEN
    ALTER TABLE equipment
    ADD CONSTRAINT equipment_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;