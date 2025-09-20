-- Migration 002: Create Performance Indexes
-- Optimizes database for common queries and relationships
-- Run after tables are created

-- Demographics indexes
CREATE INDEX IF NOT EXISTS idx_demographics_zip ON demographics(zip_code);
CREATE INDEX IF NOT EXISTS idx_demographics_income ON demographics(median_income);
CREATE INDEX IF NOT EXISTS idx_demographics_county ON demographics(county);

-- Youth programs indexes
CREATE INDEX IF NOT EXISTS idx_youth_programs_cost ON youth_programs(cost_per_session);
CREATE INDEX IF NOT EXISTS idx_youth_programs_age ON youth_programs(age_min, age_max);
CREATE INDEX IF NOT EXISTS idx_youth_programs_location ON youth_programs(location_lat, location_lng);

-- Mentors indexes
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_hourly_rate ON mentors(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_mentors_available ON mentors(available);
CREATE INDEX IF NOT EXISTS idx_mentors_specialties ON mentors USING GIN(specialties);

-- Community features indexes
CREATE INDEX IF NOT EXISTS idx_golf_groups_course_id ON golf_groups(course_id);
CREATE INDEX IF NOT EXISTS idx_golf_groups_created_by ON golf_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_golf_groups_date ON golf_groups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_golf_groups_status ON golf_groups(status);

CREATE INDEX IF NOT EXISTS idx_golf_group_members_group_id ON golf_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_golf_group_members_user_id ON golf_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_partner_requests_user_id ON partner_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_requests_course_id ON partner_requests(course_id);
CREATE INDEX IF NOT EXISTS idx_partner_requests_date ON partner_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_partner_requests_status ON partner_requests(status);

-- Accessibility scores indexes
CREATE INDEX IF NOT EXISTS idx_accessibility_zip ON accessibility_scores(zip_code);
CREATE INDEX IF NOT EXISTS idx_accessibility_score ON accessibility_scores(accessibility_score);
CREATE INDEX IF NOT EXISTS idx_accessibility_course_id ON accessibility_scores(course_id);

-- Chat feature indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_mode ON chat_conversations(mode);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Core table indexes (if not already exist)
CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);

CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_zip_code ON users(zip_code);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_lat, location_lng);

CREATE INDEX IF NOT EXISTS idx_courses_location ON courses(lat, lng);
CREATE INDEX IF NOT EXISTS idx_courses_youth_programs ON courses(youth_programs);
CREATE INDEX IF NOT EXISTS idx_courses_green_fee ON courses(green_fee_min, green_fee_max);