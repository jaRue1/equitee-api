const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

// Calculate accessibility score based on income, distance, and cost
function calculateAccessibilityScore(medianIncome, course, distance) {
  // Average green fee
  const avgGreenFee = (course.green_fee_min + course.green_fee_max) / 2;

  // Estimated annual golf cost (24 rounds per year + equipment/lessons)
  const annualCost = (avgGreenFee * 24) + 500 + 800; // rounds + equipment + lessons

  // Affordability ratio (higher income / lower cost = more accessible)
  const affordabilityRatio = medianIncome / annualCost;

  // Distance penalty (closer is better, max 30 miles)
  const distancePenalty = Math.max(0.1, 1 - (distance / 30));

  // Youth program bonus
  const youthProgramBonus = course.youth_programs ? 1.3 : 1.0;

  // Equipment rental bonus
  const equipmentBonus = course.equipment_rental ? 1.1 : 1.0;

  // Municipal/affordable course bonus (lower green fees)
  const affordableCourseBonus = avgGreenFee <= 50 ? 1.2 : 1.0;

  // Calculate raw score
  const rawScore = affordabilityRatio * distancePenalty * youthProgramBonus * equipmentBonus * affordableCourseBonus;

  // Normalize to 0-100 scale
  const normalizedScore = Math.min(100, Math.max(0, rawScore * 5));

  return {
    accessibilityScore: Math.round(normalizedScore * 100) / 100,
    distanceMiles: Math.round(distance * 100) / 100,
    estimatedAnnualCost: Math.round(annualCost),
    transportScore: distance <= 5 ? 8 : distance <= 15 ? 6 : distance <= 25 ? 4 : 2
  };
}

// Get ZIP code center coordinates (simplified - using county centers)
function getZipCoordinates(zipCode, county) {
  // Simplified coordinate mapping based on county and ZIP ranges
  if (county === 'Miami-Dade') {
    if (zipCode.startsWith('331')) {
      return { lat: 25.7617, lng: -80.1918 }; // Miami area
    } else if (zipCode.startsWith('330')) {
      return { lat: 25.8659, lng: -80.2078 }; // North Miami
    }
    return { lat: 25.7617, lng: -80.1918 }; // Default Miami
  } else if (county === 'Broward') {
    if (zipCode.startsWith('333')) {
      return { lat: 26.1224, lng: -80.1373 }; // Fort Lauderdale area
    } else if (zipCode.startsWith('334')) {
      return { lat: 26.4615, lng: -80.0728 }; // Deerfield Beach area
    }
    return { lat: 26.1224, lng: -80.1373 }; // Default Fort Lauderdale
  } else if (county === 'Palm Beach') {
    if (zipCode.startsWith('334')) {
      return { lat: 26.7056, lng: -80.0364 }; // Palm Beach area
    } else if (zipCode.startsWith('335')) {
      return { lat: 26.5284, lng: -80.1456 }; // West Palm Beach area
    }
    return { lat: 26.7056, lng: -80.0364 }; // Default Palm Beach
  }

  return { lat: 25.7617, lng: -80.1918 }; // Default to Miami
}

async function seedAccessibilityScores() {
  console.log('🏌️ Starting accessibility scores seeding...');

  try {
    // Get all demographics data
    console.log('📊 Fetching demographics data...');
    const { data: demographics, error: demoError } = await supabase
      .from('demographics')
      .select('*');

    if (demoError) {
      throw new Error(`Failed to fetch demographics: ${demoError.message}`);
    }

    console.log(`Found ${demographics.length} ZIP codes`);

    // Get all courses
    console.log('🏌️ Fetching courses data...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');

    if (coursesError) {
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    console.log(`Found ${courses.length} courses`);

    // Clear existing accessibility scores
    console.log('🧹 Clearing existing accessibility scores...');
    const { error: deleteError } = await supabase
      .from('accessibility_scores')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.warn(`Warning: Could not clear existing scores: ${deleteError.message}`);
    }

    // Calculate accessibility scores for each ZIP code + course combination
    const accessibilityRecords = [];
    let recordCount = 0;

    console.log('📈 Calculating accessibility scores...');

    for (const demo of demographics) {
      const zipCoords = getZipCoordinates(demo.zip_code, demo.county);

      for (const course of courses) {
        // Skip courses too far away (> 50 miles)
        const distance = calculateDistance(
          zipCoords.lat,
          zipCoords.lng,
          course.lat,
          course.lng
        );

        if (distance <= 50) { // Only include courses within 50 miles
          const scores = calculateAccessibilityScore(demo.median_income, course, distance);

          accessibilityRecords.push({
            zip_code: demo.zip_code,
            course_id: course.id,
            accessibility_score: scores.accessibilityScore,
            distance_miles: scores.distanceMiles,
            estimated_annual_cost: scores.estimatedAnnualCost,
            transport_score: scores.transportScore
          });

          recordCount++;
        }
      }

      if (recordCount % 100 === 0) {
        console.log(`Processed ${recordCount} accessibility calculations...`);
      }
    }

    console.log(`💾 Saving ${accessibilityRecords.length} accessibility scores to database...`);

    // Insert in batches of 500 to avoid timeout
    const batchSize = 500;
    for (let i = 0; i < accessibilityRecords.length; i += batchSize) {
      const batch = accessibilityRecords.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('accessibility_scores')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${i}-${i + batch.length}: ${insertError.message}`);
      } else {
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(accessibilityRecords.length/batchSize)}`);
      }
    }

    // Verify the data was inserted
    const { data: verifyData, error: verifyError } = await supabase
      .from('accessibility_scores')
      .select('count', { count: 'exact' });

    if (verifyError) {
      console.warn(`Warning: Could not verify insert: ${verifyError.message}`);
    } else {
      console.log(`🎉 Successfully seeded ${accessibilityRecords.length} accessibility score records!`);
    }

    // Show some sample high and low accessibility areas
    console.log('\n📊 Sample Results:');

    const { data: highAccessibility } = await supabase
      .from('accessibility_scores')
      .select(`
        zip_code,
        accessibility_score,
        distance_miles,
        estimated_annual_cost,
        courses (name)
      `)
      .order('accessibility_score', { ascending: false })
      .limit(5);

    console.log('\n🏆 TOP 5 Most Accessible Golf Options:');
    highAccessibility?.forEach((record, index) => {
      console.log(`${index + 1}. ZIP ${record.zip_code} → ${record.courses.name}`);
      console.log(`   Score: ${record.accessibility_score}/100 | Distance: ${record.distance_miles} miles | Annual Cost: $${record.estimated_annual_cost}`);
    });

    const { data: lowAccessibility } = await supabase
      .from('accessibility_scores')
      .select(`
        zip_code,
        accessibility_score,
        distance_miles,
        estimated_annual_cost,
        courses (name)
      `)
      .order('accessibility_score', { ascending: true })
      .limit(5);

    console.log('\n📉 BOTTOM 5 Least Accessible Golf Options:');
    lowAccessibility?.forEach((record, index) => {
      console.log(`${index + 1}. ZIP ${record.zip_code} → ${record.courses.name}`);
      console.log(`   Score: ${record.accessibility_score}/100 | Distance: ${record.distance_miles} miles | Annual Cost: $${record.estimated_annual_cost}`);
    });

  } catch (error) {
    console.error('❌ Error seeding accessibility scores:', error.message);
    process.exit(1);
  }
}

// Run the seeding
seedAccessibilityScores().then(() => {
  console.log('\n✅ Accessibility scores seeding completed!');
  process.exit(0);
});