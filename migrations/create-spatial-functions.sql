-- Create spatial functions for mentor search

-- Function to find nearby mentors
CREATE OR REPLACE FUNCTION find_mentors_nearby(
  user_lat FLOAT,
  user_lng FLOAT,
  max_distance FLOAT DEFAULT 25,
  max_hourly_rate INTEGER DEFAULT 200
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  bio TEXT,
  experience_years INTEGER,
  hourly_rate INTEGER,
  specialties TEXT[],
  certifications TEXT[],
  location_radius INTEGER,
  contact_info JSONB,
  name TEXT,
  email TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  distance_miles FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.bio,
    m.experience_years,
    m.hourly_rate,
    m.specialties,
    m.certifications,
    m.location_radius,
    m.contact_info,
    u.name,
    u.email,
    u.location_lat,
    u.location_lng,
    calculate_distance(user_lat, user_lng, u.location_lat, u.location_lng) as distance_miles
  FROM mentors m
  JOIN users u ON m.user_id = u.id
  WHERE m.available = true
    AND m.hourly_rate <= max_hourly_rate
    AND calculate_distance(user_lat, user_lng, u.location_lat, u.location_lng) <= max_distance
  ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to find nearby youth programs
CREATE OR REPLACE FUNCTION find_youth_programs_nearby(
  user_lat FLOAT,
  user_lng FLOAT,
  max_distance FLOAT DEFAULT 25,
  min_age INTEGER DEFAULT 5,
  max_age INTEGER DEFAULT 18,
  max_cost INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  organization TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  address TEXT,
  age_min INTEGER,
  age_max INTEGER,
  cost_per_session INTEGER,
  schedule_days TEXT[],
  description TEXT,
  equipment_provided BOOLEAN,
  transportation_available BOOLEAN,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  distance_miles FLOAT,
  age_range TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    yp.id,
    yp.name,
    yp.organization,
    yp.location_lat,
    yp.location_lng,
    yp.address,
    yp.age_min,
    yp.age_max,
    yp.cost_per_session,
    yp.schedule_days,
    yp.description,
    yp.equipment_provided,
    yp.transportation_available,
    yp.contact_info,
    yp.created_at,
    calculate_distance(user_lat, user_lng, yp.location_lat, yp.location_lng) as distance_miles,
    (yp.age_min::text || '-' || yp.age_max::text || ' years') as age_range
  FROM youth_programs yp
  WHERE calculate_distance(user_lat, user_lng, yp.location_lat, yp.location_lng) <= max_distance
    AND yp.age_min <= max_age
    AND yp.age_max >= min_age
    AND yp.cost_per_session <= max_cost
  ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql;