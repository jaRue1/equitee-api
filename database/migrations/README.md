# EquiTee Database Migrations

## Overview
All database operations that change the state of the database are organized as migrations. Run these in order to set up the complete EquiTee database.

## Migration Order

### **001_create_core_tables.sql**
- Creates all essential tables for the platform
- Includes community features (golf_groups, partner_requests, etc.)
- Sets up chat system tables for AI coach
- Establishes foreign key relationships

### **002_create_indexes.sql**
- Performance optimization indexes
- Spatial indexes for location queries
- Search optimization for all tables

### **003_seed_demographics_data.sql**
- Loads 143 real ZIP codes with US Census data
- Income and population data for South Florida
- Foundation for accessibility analysis

### **004_seed_youth_programs.sql**
- 6 verified youth golf programs
- First Tee, PGA, and municipal programs
- Real contact information and pricing

### **005_seed_mentors.sql**
- 13 verified golf professionals
- PGA pros, First Tee coaches, municipal instructors
- Real facility domains and contact info

### **006_create_spatial_functions.sql**
- Location-based query functions
- Required for AI agent functionality
- Enables distance calculations and nearby searches

## How to Run

### Option 1: Supabase Dashboard
1. Go to SQL Editor in your Supabase dashboard
2. Copy/paste each migration file in order
3. Run each migration

### Option 2: Command Line (if using psql)
```bash
psql "your_supabase_connection_string" -f database/migrations/001_create_core_tables.sql
psql "your_supabase_connection_string" -f database/migrations/002_create_indexes.sql
psql "your_supabase_connection_string" -f database/migrations/003_seed_demographics_data.sql
psql "your_supabase_connection_string" -f database/migrations/004_seed_youth_programs.sql
psql "your_supabase_connection_string" -f database/migrations/005_seed_mentors.sql
psql "your_supabase_connection_string" -f database/migrations/006_create_spatial_functions.sql
```

## Expected Results After All Migrations

### Tables Created:
- **users** (existing + 13 mentor accounts)
- **courses** (existing)
- **equipment** (existing)
- **demographics** (143 ZIP codes)
- **youth_programs** (6 programs)
- **mentors** (13 professionals)
- **golf_groups** (community feature)
- **golf_group_members** (community feature)
- **partner_requests** (community feature)
- **accessibility_scores** (computed data)
- **chat_conversations** (AI coach)
- **chat_messages** (AI coach)

### Data Loaded:
- **143 demographics records** (real Census data)
- **6 youth programs** (verified real programs)
- **13 mentors** (verified golf professionals)
- **Spatial functions** for location queries

### Relationships Established:
- `equipment.user_id` → `users.id`
- `mentors.user_id` → `users.id`
- `golf_groups.course_id` → `courses.id`
- `golf_groups.created_by` → `users.id`
- All other foreign keys as defined in ERD

## Verification Queries

After running all migrations, verify with:

```sql
-- Count all records
SELECT 'demographics' as table_name, COUNT(*) as count FROM demographics
UNION ALL
SELECT 'youth_programs', COUNT(*) FROM youth_programs
UNION ALL
SELECT 'mentors', COUNT(*) FROM mentors
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment;

-- Test spatial functions
SELECT * FROM find_youth_programs_nearby(25.7617, -80.1918, 25, 50, 5, 17) LIMIT 3;
SELECT * FROM find_mentors_nearby(25.7617, -80.1918, 30, 100) LIMIT 3;
```

## Notes
- All migrations are idempotent (safe to run multiple times)
- Real data from verified sources (US Census, PGA professionals, etc.)
- Includes all features needed for Day 2 spec implementation
- Ready for AI agent and community features development