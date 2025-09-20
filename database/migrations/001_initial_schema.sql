-- EquiTee Database Schema
-- Initial migration to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Courses Table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Equipment Table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_location ON users(location_lat, location_lng);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_zip_code ON users(zip_code);

CREATE INDEX idx_courses_location ON courses(lat, lng);
CREATE INDEX idx_courses_youth_programs ON courses(youth_programs);
CREATE INDEX idx_courses_green_fees ON courses(green_fee_min, green_fee_max);

CREATE INDEX idx_equipment_user_id ON equipment(user_id);
CREATE INDEX idx_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_location ON equipment(location_lat, location_lng);
CREATE INDEX idx_equipment_price ON equipment(price);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();