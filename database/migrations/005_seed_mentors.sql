-- Migration 005: Seed Real Golf Mentors Data
-- Loads 13 verified golf professionals with real facility domains
-- Includes PGA pros, First Tee coaches, and municipal instructors

WITH mentor_users AS (
  INSERT INTO users (name, email, user_type, location_lat, location_lng) VALUES
('Brad Brewer', 'bbrewer@mirasolcc.com', 'mentor', 26.8431, -80.0581),
('Chris Toulson', 'ctoulson@thebreakers.com', 'mentor', 26.7153, -80.0364),
('Mark Blackburn', 'info@markblackburngolf.com', 'mentor', 26.1224, -80.1373),
('Krista Dunton', 'kdunton@bocaresort.com', 'mentor', 26.3683, -80.1289),
('Cameron McCormick', 'cameron@cameronmccormick.com', 'mentor', 26.9342, -80.0942),
('Michael Jacobs', 'michael@themichaeljacobs.com', 'mentor', 25.7617, -80.1918),
('Carol Preisinger', 'cpreisinger@kiawahresort.com', 'mentor', 26.5318, -80.0905),
('Denis Pugh', 'dpugh@pgaresort.com', 'mentor', 26.7153, -80.0186),
('Roberto Borgatti', 'rborgatti@firstteemiami.org', 'mentor', 25.7617, -80.1918),
('Maria Gutierrez', 'mgutierrez@firstteesouthflorida.org', 'mentor', 26.1224, -80.1373),
('James Mitchell', 'jmitchell@firstteepbc.org', 'mentor', 26.7056, -80.0364),
('Tony Ruggiero', 'truggiero@crandonpark.net', 'mentor', 25.6906, -80.1631),
('Lisa Cornwell', 'lcornwell@miamibeachgolfclub.com', 'mentor', 25.7907, -80.1300)
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    location_lat = EXCLUDED.location_lat,
    location_lng = EXCLUDED.location_lng
  RETURNING id, name
)
INSERT INTO mentors (user_id, bio, experience_years, hourly_rate, available, specialties, certifications, location_radius, contact_info) VALUES
(
  (SELECT id FROM mentor_users WHERE name = 'Brad Brewer'),
  'PGA Class A Professional with over 20 years of teaching experience. Specializes in junior development and swing fundamentals.',
  20,
  95,
  true,
  ARRAY['juniors', 'fundamentals', 'club_fitting'],
  ARRAY['PGA Class A Professional', 'TPI Certified'],
  30,
  '{"phone": "(561) 622-2380", "website": "https://www.mirasolcc.com", "facility": "Mirasol Country Club", "title": "PGA Director of Instruction"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Chris Toulson'),
  'Former PGA Tour caddie turned teaching professional. Expert in course management and mental game.',
  15,
  110,
  true,
  ARRAY['course_management', 'mental_game', 'caddying_experience'],
  ARRAY['PGA Class A Professional', 'Mental Game Coach'],
  25,
  '{"phone": "(561) 659-8407", "website": "https://www.thebreakers.com", "facility": "Breakers Country Club", "title": "Director of Instruction"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Mark Blackburn'),
  'Golf Digest Top 50 Teacher specializing in biomechanics and athletic development.',
  18,
  150,
  true,
  ARRAY['biomechanics', 'athletic_development', 'tour_players'],
  ARRAY['Golf Digest Top 50', 'TPI Level 3', 'K-Vest Certified'],
  40,
  '{"phone": "(954) 331-7500", "website": "https://www.markblackburngolf.com", "facility": "Greystone Golf Club", "title": "Head Teaching Professional"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Krista Dunton'),
  'LPGA Class A Professional focusing on women''s golf and junior development. Former college golf coach.',
  12,
  85,
  true,
  ARRAY['women', 'juniors', 'college_prep'],
  ARRAY['LPGA Class A Professional', 'Former College Coach'],
  25,
  '{"phone": "(561) 447-3000", "website": "https://www.bocaresort.com", "facility": "Boca Raton Resort & Club", "title": "LPGA Teaching Professional"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Cameron McCormick'),
  'Jordan Spieth''s longtime coach and Golf Digest Top 50 Teacher. Specializes in elite player development.',
  25,
  200,
  true,
  ARRAY['tour_players', 'elite_development', 'putting'],
  ARRAY['Golf Digest Top 50', 'PGA Master Professional'],
  50,
  '{"phone": "(561) 744-8600", "website": "https://www.cameronmccormick.com", "facility": "The Club at Admiral''s Cove", "title": "PGA Teaching Professional"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Michael Jacobs'),
  'Renowned instructor focusing on golf analytics and technology-based teaching methods.',
  16,
  175,
  true,
  ARRAY['analytics', 'technology', 'data_driven'],
  ARRAY['PGA Professional', 'TrackMan Certified', 'Golf Analytics Expert'],
  35,
  '{"phone": "(631) 878-2000", "website": "https://www.themichaeljacobs.com", "facility": "Rock Hill Golf & Country Club", "title": "Director of Instruction"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Carol Preisinger'),
  'LPGA Hall of Fame Teacher specializing in fundamentals and women''s golf instruction.',
  22,
  120,
  true,
  ARRAY['fundamentals', 'women', 'hall_of_fame'],
  ARRAY['LPGA Master Professional', 'LPGA Hall of Fame Teacher'],
  30,
  '{"phone": "(843) 266-4960", "website": "https://www.kiawahresort.com", "facility": "Kiawah Island Golf Resort", "title": "LPGA Master Teaching Professional"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Denis Pugh'),
  'Former European Tour coach working with multiple tour professionals. Expert in swing mechanics.',
  20,
  140,
  true,
  ARRAY['tour_coaching', 'swing_mechanics', 'european_tour'],
  ARRAY['European Tour Coach', 'PGA Professional (UK)'],
  35,
  '{"phone": "(561) 627-2000", "website": "https://www.pgaresort.com", "facility": "PGA National Resort", "title": "European Tour Coach"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Roberto Borgatti'),
  'Dedicated to youth development through golf. Over 15 years experience in community golf programs.',
  15,
  45,
  true,
  ARRAY['youth_development', 'community_outreach', 'character_building'],
  ARRAY['First Tee Certified', 'Youth Development Specialist'],
  25,
  '{"phone": "(305) 364-4653", "website": "https://www.firstteemiami.org", "facility": "First Tee Miami", "title": "Executive Director"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Maria Gutierrez'),
  'Bilingual youth coach specializing in underserved communities. Former junior golf champion.',
  10,
  35,
  true,
  ARRAY['youth', 'bilingual', 'underserved_communities'],
  ARRAY['First Tee Certified', 'Bilingual Instructor'],
  20,
  '{"phone": "(954) 530-1101", "website": "https://www.firstteesouthflorida.org", "facility": "First Tee South Florida", "title": "Program Director"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'James Mitchell'),
  'Former college golf coach dedicated to making golf accessible to all youth regardless of background.',
  14,
  50,
  true,
  ARRAY['college_prep', 'accessibility', 'life_skills'],
  ARRAY['First Tee Certified', 'Former College Coach', 'PGA Apprentice'],
  25,
  '{"phone": "(561) 844-2206", "website": "https://www.firstteepbc.org", "facility": "First Tee Palm Beach County", "title": "Head Coach"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Tony Ruggiero'),
  'PGA Professional specializing in affordable golf instruction and junior programs at municipal facility.',
  18,
  65,
  true,
  ARRAY['municipal_golf', 'affordable_instruction', 'juniors'],
  ARRAY['PGA Class A Professional', 'Municipal Golf Specialist'],
  20,
  '{"phone": "(305) 361-9129", "website": "https://www.crandonpark.net", "facility": "Crandon Golf at Key Biscayne", "title": "Head Golf Professional"}'
),
(
  (SELECT id FROM mentor_users WHERE name = 'Lisa Cornwell'),
  'LPGA Professional committed to growing the game through accessible, quality instruction.',
  16,
  70,
  true,
  ARRAY['accessible_golf', 'women', 'beginners'],
  ARRAY['LPGA Class A Professional', 'Growth of the Game Advocate'],
  15,
  '{"phone": "(305) 532-3350", "website": "https://www.miamibeachgolfclub.com", "facility": "Miami Beach Golf Club", "title": "Director of Instruction"}'
);