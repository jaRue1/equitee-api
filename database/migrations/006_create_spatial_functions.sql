-- Migration 006: Create Spatial Functions for Location Queries
-- Functions for finding nearby programs, mentors, and courses
-- Required for Day 2 spec AI agent functionality

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
    AND yp.location_lat IS NOT NULL
    AND yp.location_lng IS NOT NULL
    AND (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(yp.location_lat)) *
        cos(radians(yp.location_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(yp.location_lat))
      )
    ) <= max_distance
  ORDER BY distance_miles;
$$;

-- Function to find nearby mentors
CREATE OR REPLACE FUNCTION find_mentors_nearby(
  user_lat DECIMAL(10,8),
  user_lng DECIMAL(11,8),
  max_distance INTEGER,
  max_hourly_rate DECIMAL(6,2)
) RETURNS TABLE (
  id UUID,
  name VARCHAR,
  email VARCHAR,
  bio TEXT,
  hourly_rate DECIMAL(6,2),
  specialties VARCHAR[],
  certifications VARCHAR[],
  distance_miles DECIMAL(6,2),
  contact_info JSONB
) LANGUAGE sql STABLE AS $$
  SELECT
    m.id,
    u.name,
    u.email,
    m.bio,
    m.hourly_rate,
    m.specialties,
    m.certifications,
    ROUND(
      (3959 * acos(
        cos(radians(user_lat)) * cos(radians(u.location_lat)) *
        cos(radians(u.location_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(u.location_lat))
      ))::numeric, 2
    ) as distance_miles,
    m.contact_info
  FROM mentors m
  JOIN users u ON m.user_id = u.id
  WHERE m.available = true
    AND m.hourly_rate <= max_hourly_rate
    AND u.location_lat IS NOT NULL
    AND u.location_lng IS NOT NULL
    AND (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(u.location_lat)) *
        cos(radians(u.location_lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(u.location_lat))
      )
    ) <= max_distance
  ORDER BY distance_miles;
$$;

-- Function to find nearby courses
CREATE OR REPLACE FUNCTION find_courses_nearby(
  user_lat DECIMAL(10,8),
  user_lng DECIMAL(11,8),
  max_distance INTEGER,
  max_green_fee INTEGER DEFAULT NULL,
  youth_programs_only BOOLEAN DEFAULT false
) RETURNS TABLE (
  id UUID,
  name VARCHAR,
  address VARCHAR,
  distance_miles DECIMAL(6,2),
  green_fee_min INTEGER,
  green_fee_max INTEGER,
  youth_programs BOOLEAN,
  equipment_rental BOOLEAN,
  difficulty_rating INTEGER
) LANGUAGE sql STABLE AS $$
  SELECT
    c.id,
    c.name,
    c.address,
    ROUND(
      (3959 * acos(
        cos(radians(user_lat)) * cos(radians(c.lat)) *
        cos(radians(c.lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(c.lat))
      ))::numeric, 2
    ) as distance_miles,
    c.green_fee_min,
    c.green_fee_max,
    c.youth_programs,
    c.equipment_rental,
    c.difficulty_rating
  FROM courses c
  WHERE (max_green_fee IS NULL OR c.green_fee_max <= max_green_fee)
    AND (youth_programs_only = false OR c.youth_programs = true)
    AND (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(c.lat)) *
        cos(radians(c.lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(c.lat))
      )
    ) <= max_distance
  ORDER BY distance_miles;
$$;

-- Function to find nearby equipment
CREATE OR REPLACE FUNCTION find_equipment_nearby(
  user_lat DECIMAL(10,8),
  user_lng DECIMAL(11,8),
  max_distance INTEGER,
  max_price INTEGER DEFAULT NULL,
  equipment_type_filter VARCHAR DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  title VARCHAR,
  equipment_type VARCHAR,
  condition VARCHAR,
  price INTEGER,
  distance_miles DECIMAL(6,2),
  seller_name VARCHAR,
  seller_email VARCHAR
) LANGUAGE sql STABLE AS $$
  SELECT
    e.id,
    e.title,
    e.equipment_type::VARCHAR,
    e.condition::VARCHAR,
    e.price,
    ROUND(
      (3959 * acos(
        cos(radians(user_lat)) * cos(radians(COALESCE(e.location_lat, u.location_lat))) *
        cos(radians(COALESCE(e.location_lng, u.location_lng)) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(COALESCE(e.location_lat, u.location_lat)))
      ))::numeric, 2
    ) as distance_miles,
    u.name as seller_name,
    u.email as seller_email
  FROM equipment e
  JOIN users u ON e.user_id = u.id
  WHERE e.status = 'available'
    AND (max_price IS NULL OR e.price <= max_price)
    AND (equipment_type_filter IS NULL OR e.equipment_type::VARCHAR = equipment_type_filter)
    AND (e.location_lat IS NOT NULL OR u.location_lat IS NOT NULL)
    AND (e.location_lng IS NOT NULL OR u.location_lng IS NOT NULL)
    AND (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(COALESCE(e.location_lat, u.location_lat))) *
        cos(radians(COALESCE(e.location_lng, u.location_lng)) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(COALESCE(e.location_lat, u.location_lat)))
      )
    ) <= max_distance
  ORDER BY distance_miles;
$$;