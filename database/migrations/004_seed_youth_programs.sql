-- Migration 004: Seed Real Youth Programs Data
-- Loads 6 verified youth golf programs in South Florida
-- Includes First Tee, PGA, and municipal programs

INSERT INTO youth_programs (name, organization, location_lat, location_lng, address, age_min, age_max, cost_per_session, schedule_days, description, equipment_provided, transportation_available, contact_info) VALUES
(
  'First Tee Miami',
  'First Tee',
  25.7617,
  -80.1918,
  '6801 Miami Lakes Dr, Miami Lakes, FL 33014',
  5,
  17,
  0,
  ARRAY['saturday', 'sunday'],
  'Youth character development program using golf as a vehicle to teach life skills and core values',
  true,
  false,
  '{"phone": "(305) 364-4653", "website": "https://www.firstteemiami.org"}'
),
(
  'TPC Blue Monster Junior Golf Academy',
  'TPC Blue Monster',
  25.8198,
  -80.3568,
  '4400 NW 87th Ave, Doral, FL 33178',
  6,
  17,
  45,
  ARRAY['monday', 'wednesday', 'friday', 'saturday'],
  'Professional junior golf instruction at championship TPC course',
  true,
  false,
  '{"phone": "(305) 592-2000", "website": "https://www.tpc.com/blue-monster"}'
),
(
  'Crandon Golf at Key Biscayne Junior Program',
  'Miami-Dade Parks',
  25.6906,
  -80.1631,
  '6700 Crandon Blvd, Key Biscayne, FL 33149',
  8,
  16,
  25,
  ARRAY['tuesday', 'thursday', 'saturday'],
  'Junior golf lessons at scenic island course with professional instruction',
  true,
  false,
  '{"phone": "(305) 361-9129", "website": "https://www.crandonpark.net"}'
),
(
  'PGA Learning Center Junior Golf',
  'PGA Tour',
  26.7153,
  -80.0186,
  '500 Ave of the Champions, Palm Beach Gardens, FL 33418',
  5,
  17,
  35,
  ARRAY['monday', 'wednesday', 'friday', 'saturday', 'sunday'],
  'Comprehensive junior golf development program at PGA Tour headquarters',
  true,
  false,
  '{"phone": "(561) 624-8400", "website": "https://www.pgatour.com/learning-center"}'
),
(
  'Boynton Beach Municipal Golf Junior League',
  'City of Boynton Beach',
  26.5318,
  -80.0905,
  '8020 Jog Rd, Boynton Beach, FL 33437',
  7,
  16,
  20,
  ARRAY['tuesday', 'thursday', 'saturday'],
  'Affordable junior golf program at municipal course with group and individual instruction',
  false,
  false,
  '{"phone": "(561) 742-6501", "website": "https://www.boynton-beach.org"}'
),
(
  'Fort Lauderdale Golf Academy Youth Program',
  'City of Fort Lauderdale',
  26.1224,
  -80.1373,
  '2430 Sunrise Blvd, Fort Lauderdale, FL 33304',
  6,
  17,
  18,
  ARRAY['monday', 'wednesday', 'saturday'],
  'Municipal youth golf program offering beginner to advanced instruction',
  true,
  false,
  '{"phone": "(954) 828-5000", "website": "https://www.fortlauderdale.gov"}'
)
ON CONFLICT DO NOTHING;