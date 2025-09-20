import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const southFloridaCourses = [
  // Palm Beach County
  {
    name: "Sandhill Crane Golf Club",
    address: "9500 Sandhill Crane Drive, Palm Beach Gardens, FL 33412",
    lat: 26.8622,
    lng: -80.1373,
    green_fee_min: 25,
    green_fee_max: 65,
    youth_programs: true,
    difficulty_rating: 3.5,
    equipment_rental: true,
    contact_info: {
      phone: "561-630-1160",
      website: "https://www.pbgfl.gov/1414/Sandhill-Crane-Golf-Club"
    },
    website: "https://www.pbgfl.gov/1414/Sandhill-Crane-Golf-Club"
  },
  {
    name: "Abacoa Golf Club",
    address: "105 Barbados Dr. Jupiter, FL 33458",
    lat: 26.9342,
    lng: -80.1628,
    green_fee_min: 35,
    green_fee_max: 85,
    youth_programs: true,
    difficulty_rating: 4.0,
    equipment_rental: true,
    contact_info: {
      website: "https://abacoagolfclub.com/"
    },
    website: "https://abacoagolfclub.com/"
  },
  {
    name: "North Palm Beach Country Club",
    address: "951 US Highway 1, North Palm Beach, FL 33408",
    lat: 26.8157,
    lng: -80.0531,
    green_fee_min: 40,
    green_fee_max: 95,
    youth_programs: true,
    difficulty_rating: 4.2,
    equipment_rental: true,
    contact_info: {
      phone: "561-841-3380"
    },
    website: "https://www.village-npb.org/453/Country-Club"
  },
  {
    name: "The Park West Palm Beach",
    address: "7301 Georgia Avenue West Palm Beach, FL 33405",
    lat: 26.6767,
    lng: -80.1918,
    green_fee_min: 30,
    green_fee_max: 70,
    youth_programs: true,
    difficulty_rating: 3.8,
    equipment_rental: true,
    contact_info: {
      phone: "561-530-3810"
    },
    website: "https://theparkwestpalm.com/"
  },
  {
    name: "Palm Beach Par 3 Golf Course",
    address: "2345 South Ocean Blvd, Palm Beach, FL 33480",
    lat: 26.7056,
    lng: -80.0364,
    green_fee_min: 25,
    green_fee_max: 45,
    youth_programs: true,
    difficulty_rating: 2.5,
    equipment_rental: true,
    contact_info: {
      phone: "561-547-0598"
    },
    website: "https://www.golfontheocean.com/"
  },
  {
    name: "Osprey Point Golf Course",
    address: "12551 Glades Rd Boca Raton, FL 33498",
    lat: 26.3683,
    lng: -80.2456,
    green_fee_min: 40,
    green_fee_max: 100,
    youth_programs: true,
    difficulty_rating: 4.1,
    equipment_rental: true,
    contact_info: {
      phone: "561-482-2868"
    },
    website: "https://www.pbcospreypointgolf.com/"
  },
  {
    name: "Red Reef Golf Course",
    address: "1221 N Ocean Blvd, Boca Raton, FL 33432",
    lat: 26.3598,
    lng: -80.0781,
    green_fee_min: 20,
    green_fee_max: 55,
    youth_programs: true,
    difficulty_rating: 3.2,
    equipment_rental: true,
    contact_info: {
      phone: "561-391-5014"
    },
    website: "https://myboca.us/479/Golf"
  },
  {
    name: "Boca Raton Golf & Racquet Club",
    address: "17751 Boca Club Blvd. Boca Raton, FL 33487",
    lat: 26.3948,
    lng: -80.2134,
    green_fee_min: 35,
    green_fee_max: 75,
    youth_programs: false,
    difficulty_rating: 3.7,
    equipment_rental: true,
    contact_info: {
      phone: "561-367-7000"
    },
    website: "https://myboca.us/2043/Boca-Raton-Golf-Racquet-Club"
  },

  // Broward County
  {
    name: "Plantation Preserve Golf Course & Club",
    address: "7050 West Broward Blvd. Plantation, FL 33317",
    lat: 26.1224,
    lng: -80.2707,
    green_fee_min: 30,
    green_fee_max: 85,
    youth_programs: true,
    difficulty_rating: 4.0,
    equipment_rental: true,
    contact_info: {
      phone: "954-585-5020"
    },
    website: "https://www.plantation.org/government/departments/parks-recreation/plantation-preserve-golf-course-club"
  },
  {
    name: "Jacaranda Golf Club",
    address: "9200 W Broward Blvd, Plantation, FL 33324",
    lat: 26.1224,
    lng: -80.2831,
    green_fee_min: 25,
    green_fee_max: 65,
    youth_programs: true,
    difficulty_rating: 3.6,
    equipment_rental: true,
    contact_info: {
      phone: "954-472-5836"
    },
    website: "https://jacarandagolfclub.com/"
  },
  {
    name: "The Club at Emerald Hills",
    address: "4100 North Hills Drive Hollywood, FL 33021",
    lat: 26.0112,
    lng: -80.1918,
    green_fee_min: 35,
    green_fee_max: 90,
    youth_programs: false,
    difficulty_rating: 4.2,
    equipment_rental: true,
    contact_info: {
      phone: "954-961-4000"
    },
    website: "https://www.theclubatemeraldhills.com/"
  },
  {
    name: "Country Club of Coral Springs",
    address: "7201 Country Club Blvd, Coral Springs, FL 33065",
    lat: 26.2962,
    lng: -80.2707,
    green_fee_min: 40,
    green_fee_max: 95,
    youth_programs: true,
    difficulty_rating: 4.0,
    equipment_rental: true,
    contact_info: {
      phone: "954-753-3500"
    },
    website: "https://ccofcs.com/"
  },
  {
    name: "Deer Creek Golf Club",
    address: "2801 Deer Creek Country Club Blvd, Deerfield Beach, FL 33442",
    lat: 26.3186,
    lng: -80.1962,
    green_fee_min: 45,
    green_fee_max: 110,
    youth_programs: false,
    difficulty_rating: 4.3,
    equipment_rental: true,
    contact_info: {
      phone: "954-421-5550"
    },
    website: "https://deercreekflorida.com/"
  },
  {
    name: "Hollywood Beach Golf Club",
    address: "1600 Johnson St, Hollywood, FL 33020",
    lat: 26.0112,
    lng: -80.1498,
    green_fee_min: 30,
    green_fee_max: 75,
    youth_programs: true,
    difficulty_rating: 3.8,
    equipment_rental: true,
    contact_info: {
      phone: "954-921-3411"
    }
  },
  {
    name: "Eagle Trace Golf Club",
    address: "1111 Eagle Trace Blvd, Coral Springs, FL 33071",
    lat: 26.2962,
    lng: -80.2456,
    green_fee_min: 35,
    green_fee_max: 80,
    youth_programs: true,
    difficulty_rating: 4.1,
    equipment_rental: true,
    contact_info: {
      phone: "954-753-7550"
    }
  },
  {
    name: "Heron Bay Golf Club",
    address: "11801 Heron Bay Blvd, Coral Springs, FL 33076",
    lat: 26.3186,
    lng: -80.2831,
    green_fee_min: 50,
    green_fee_max: 120,
    youth_programs: false,
    difficulty_rating: 4.5,
    equipment_rental: true,
    contact_info: {
      phone: "954-796-2000"
    }
  },

  // Miami-Dade County
  {
    name: "Miami Shores Country Club",
    address: "10000 Biscayne Blvd, Miami Shores, FL 33138",
    lat: 25.8659,
    lng: -80.1667,
    green_fee_min: 25,
    green_fee_max: 70,
    youth_programs: true,
    difficulty_rating: 3.5,
    equipment_rental: true,
    contact_info: {
      phone: "305-795-2366"
    },
    website: "https://www.miamishoresgolf.com/"
  },
  {
    name: "Trump National Doral Miami",
    address: "4400 NW 87th Ave, Doral, FL 33178",
    lat: 25.8453,
    lng: -80.3381,
    green_fee_min: 100,
    green_fee_max: 300,
    youth_programs: false,
    difficulty_rating: 4.8,
    equipment_rental: true,
    contact_info: {
      phone: "305-592-2000"
    },
    website: "https://www.trumphotels.com/miami/golf/golf-courses-in-miami-fl"
  },
  {
    name: "Crandon Golf Course",
    address: "6700 Crandon Blvd, Key Biscayne, FL 33149",
    lat: 25.7073,
    lng: -80.1589,
    green_fee_min: 40,
    green_fee_max: 120,
    youth_programs: true,
    difficulty_rating: 4.2,
    equipment_rental: true,
    contact_info: {
      phone: "305-361-9129"
    }
  },
  {
    name: "Miami Beach Golf Club",
    address: "2301 Alton Rd, Miami Beach, FL 33140",
    lat: 25.8073,
    lng: -80.1420,
    green_fee_min: 35,
    green_fee_max: 85,
    youth_programs: true,
    difficulty_rating: 3.9,
    equipment_rental: true,
    contact_info: {
      phone: "305-532-3350"
    }
  },
  {
    name: "Miccosukee Golf & Country Club",
    address: "6401 Kendale Lakes Dr, Miami, FL 33183",
    lat: 25.6890,
    lng: -80.4381,
    green_fee_min: 45,
    green_fee_max: 95,
    youth_programs: true,
    difficulty_rating: 4.0,
    equipment_rental: true,
    contact_info: {
      phone: "305-382-3930"
    }
  },
  {
    name: "Fontainebleau Golf Course",
    address: "9603 Fontainebleau Blvd, Miami, FL 33172",
    lat: 25.7890,
    lng: -80.4065,
    green_fee_min: 20,
    green_fee_max: 60,
    youth_programs: true,
    difficulty_rating: 3.3,
    equipment_rental: true,
    contact_info: {
      phone: "305-221-5181"
    }
  },
  {
    name: "International Links Miami",
    address: "1802 NW 37th Ave, Miami, FL 33125",
    lat: 25.7890,
    lng: -80.2498,
    green_fee_min: 25,
    green_fee_max: 65,
    youth_programs: true,
    difficulty_rating: 3.4,
    equipment_rental: true,
    contact_info: {
      phone: "305-633-4583"
    }
  },
  {
    name: "Killian Greens Golf Club",
    address: "6104 SW 132nd Ave, Miami, FL 33183",
    lat: 25.6890,
    lng: -80.4065,
    green_fee_min: 20,
    green_fee_max: 55,
    youth_programs: true,
    difficulty_rating: 3.1,
    equipment_rental: true,
    contact_info: {
      phone: "305-386-7886"
    }
  },
  {
    name: "Costa del Sol Golf Course",
    address: "16004 Costa del Sol Blvd, Miami, FL 33193",
    lat: 25.6223,
    lng: -80.4381,
    green_fee_min: 25,
    green_fee_max: 70,
    youth_programs: true,
    difficulty_rating: 3.6,
    equipment_rental: true,
    contact_info: {
      phone: "305-388-2931"
    }
  },

  // Additional Palm Beach County Courses
  {
    name: "Okeeheelee Golf Course",
    address: "7715 Forest Hill Blvd, West Palm Beach, FL 33413",
    lat: 26.6542,
    lng: -80.1284,
    green_fee_min: 25,
    green_fee_max: 65,
    youth_programs: true,
    difficulty_rating: 3.7,
    equipment_rental: true,
    contact_info: {
      phone: "561-964-4653"
    },
    website: "https://www.pbcokeeheeleegolf.com/"
  },
  {
    name: "Delray Beach Golf Club",
    address: "2200 Highland Ave, Delray Beach, FL 33445",
    lat: 26.4615,
    lng: -80.0728,
    green_fee_min: 40,
    green_fee_max: 90,
    youth_programs: true,
    difficulty_rating: 4.0,
    equipment_rental: true,
    contact_info: {
      phone: "561-243-7380"
    },
    website: "https://www.delraybeachgolfclub.com/"
  },
  {
    name: "Kings Point Golf Club",
    address: "9700 Club South Blvd, Delray Beach, FL 33446",
    lat: 26.4445,
    lng: -80.1456,
    green_fee_min: 30,
    green_fee_max: 70,
    youth_programs: true,
    difficulty_rating: 3.4,
    equipment_rental: true,
    contact_info: {
      phone: "561-498-2222"
    },
    website: "https://kingspointdelraybeachgolf.com/"
  },
  {
    name: "Seagate Golf Club",
    address: "4200 Jog Rd, Delray Beach, FL 33445",
    lat: 26.4615,
    lng: -80.1456,
    green_fee_min: 80,
    green_fee_max: 180,
    youth_programs: false,
    difficulty_rating: 4.4,
    equipment_rental: true,
    contact_info: {
      phone: "561-243-7300"
    },
    website: "https://www.seagatedelray.com/golf-club"
  },
  {
    name: "Golf Club of Jupiter",
    address: "115 Eagle Tree Ter, Jupiter, FL 33477",
    lat: 26.9231,
    lng: -80.1284,
    green_fee_min: 45,
    green_fee_max: 105,
    youth_programs: true,
    difficulty_rating: 4.1,
    equipment_rental: true,
    contact_info: {
      phone: "561-747-6262"
    },
    website: "https://golfclubofjupiter.com/"
  },
  {
    name: "Jupiter Country Club",
    address: "126 Club Dr, Jupiter, FL 33469",
    lat: 26.9342,
    lng: -80.0947,
    green_fee_min: 75,
    green_fee_max: 150,
    youth_programs: false,
    difficulty_rating: 4.3,
    equipment_rental: true,
    contact_info: {
      phone: "561-746-1262"
    },
    website: "https://www.invitedclubs.com/clubs/jupiter-country-club"
  },
  {
    name: "The Bear's Club",
    address: "13141 Keating Dr, Jupiter, FL 33478",
    lat: 26.9567,
    lng: -80.1456,
    green_fee_min: 200,
    green_fee_max: 400,
    youth_programs: false,
    difficulty_rating: 4.8,
    equipment_rental: false,
    contact_info: {
      phone: "561-747-9500"
    }
  },
  {
    name: "West Palm Beach Municipal Golf Course",
    address: "7001 Parker Ave, West Palm Beach, FL 33405",
    lat: 26.6767,
    lng: -80.1748,
    green_fee_min: 20,
    green_fee_max: 50,
    youth_programs: true,
    difficulty_rating: 3.2,
    equipment_rental: true,
    contact_info: {
      phone: "561-582-2019"
    }
  },
  {
    name: "Banyan Golf Club",
    address: "8201 Jog Rd, West Palm Beach, FL 33411",
    lat: 26.6542,
    lng: -80.1456,
    green_fee_min: 35,
    green_fee_max: 85,
    youth_programs: true,
    difficulty_rating: 3.8,
    equipment_rental: true,
    contact_info: {
      phone: "561-793-1600"
    },
    website: "https://www.banyangolfclub.com/"
  },

  // Additional Broward County Courses
  {
    name: "Pompano Beach Golf Course",
    address: "1101 N Federal Hwy, Pompano Beach, FL 33062",
    lat: 26.2389,
    lng: -80.1248,
    green_fee_min: 25,
    green_fee_max: 65,
    youth_programs: true,
    difficulty_rating: 3.5,
    equipment_rental: true,
    contact_info: {
      phone: "954-786-4141"
    },
    website: "https://parks.pompanobeachfl.gov/golf"
  },
  {
    name: "Crystal Lake Country Club",
    address: "3800 Crystal Lake Dr, Pompano Beach, FL 33064",
    lat: 26.2611,
    lng: -80.1748,
    green_fee_min: 40,
    green_fee_max: 90,
    youth_programs: false,
    difficulty_rating: 4.0,
    equipment_rental: true,
    contact_info: {
      phone: "954-943-2902"
    }
  },
  {
    name: "Pine Tree Golf Club",
    address: "1201 Country Club Ln, Boynton Beach, FL 33436",
    lat: 26.5284,
    lng: -80.1456,
    green_fee_min: 50,
    green_fee_max: 120,
    youth_programs: false,
    difficulty_rating: 4.3,
    equipment_rental: true,
    contact_info: {
      phone: "561-732-6404"
    }
  },
  {
    name: "Cypress Creek Country Club",
    address: "15600 Cypress Creek Pkwy, Fort Lauderdale, FL 33919",
    lat: 26.1889,
    lng: -80.2456,
    green_fee_min: 45,
    green_fee_max: 110,
    youth_programs: false,
    difficulty_rating: 4.2,
    equipment_rental: true,
    contact_info: {
      phone: "954-724-1600"
    }
  },
  {
    name: "Inverrary Country Club",
    address: "3840 Inverrary Blvd, Lauderhill, FL 33319",
    lat: 26.1501,
    lng: -80.2331,
    green_fee_min: 60,
    green_fee_max: 140,
    youth_programs: false,
    difficulty_rating: 4.4,
    equipment_rental: true,
    contact_info: {
      phone: "954-733-7550"
    }
  },
  {
    name: "Woodlands Country Club",
    address: "4600 Woodlands Blvd, Tamarac, FL 33319",
    lat: 26.2167,
    lng: -80.2831,
    green_fee_min: 35,
    green_fee_max: 80,
    youth_programs: true,
    difficulty_rating: 3.9,
    equipment_rental: true,
    contact_info: {
      phone: "954-731-8880"
    }
  },
  {
    name: "TPC at Sawgrass Dye's Valley",
    address: "550 Player Cir, Ponte Vedra Beach, FL 32082",
    lat: 30.1919,
    lng: -81.3959,
    green_fee_min: 100,
    green_fee_max: 250,
    youth_programs: false,
    difficulty_rating: 4.6,
    equipment_rental: true,
    contact_info: {
      phone: "904-273-3235"
    }
  },

  // Additional Miami-Dade County Courses
  {
    name: "Turnberry Isle Country Club",
    address: "19735 Turnberry Way, Aventura, FL 33180",
    lat: 25.9556,
    lng: -80.1456,
    green_fee_min: 80,
    green_fee_max: 200,
    youth_programs: false,
    difficulty_rating: 4.5,
    equipment_rental: true,
    contact_info: {
      phone: "305-933-6929"
    },
    website: "https://www.turnberryislecountryclub.com/"
  },
  {
    name: "Country Club of Miami",
    address: "6801 Miami Lakes Dr, Miami Lakes, FL 33014",
    lat: 25.9089,
    lng: -80.3089,
    green_fee_min: 50,
    green_fee_max: 120,
    youth_programs: true,
    difficulty_rating: 4.1,
    equipment_rental: true,
    contact_info: {
      phone: "305-829-8456"
    },
    website: "https://www.golfccmiami.com/"
  },
  {
    name: "Shula's Golf Club",
    address: "15201 Bull Run Rd, Miami Lakes, FL 33014",
    lat: 25.9089,
    lng: -80.3381,
    green_fee_min: 45,
    green_fee_max: 110,
    youth_programs: true,
    difficulty_rating: 4.0,
    equipment_rental: true,
    contact_info: {
      phone: "305-820-8088"
    }
  },
  {
    name: "Biltmore Golf Course",
    address: "1210 Anastasia Ave, Coral Gables, FL 33134",
    lat: 25.7037,
    lng: -80.2831,
    green_fee_min: 60,
    green_fee_max: 150,
    youth_programs: true,
    difficulty_rating: 4.2,
    equipment_rental: true,
    contact_info: {
      phone: "305-460-5364"
    }
  },
  {
    name: "Palmetto Golf Course",
    address: "9300 SW 152nd St, Miami, FL 33157",
    lat: 25.6723,
    lng: -80.3456,
    green_fee_min: 20,
    green_fee_max: 55,
    youth_programs: true,
    difficulty_rating: 3.3,
    equipment_rental: true,
    contact_info: {
      phone: "305-238-2922"
    }
  },
  {
    name: "Briar Bay Golf Club",
    address: "801 Fairway Dr, Miami, FL 33183",
    lat: 25.6890,
    lng: -80.4065,
    green_fee_min: 25,
    green_fee_max: 70,
    youth_programs: true,
    difficulty_rating: 3.6,
    equipment_rental: true,
    contact_info: {
      phone: "305-270-4653"
    }
  },
  {
    name: "Don Shula Golf Course",
    address: "7601 Miami Lakes Dr, Miami Lakes, FL 33014",
    lat: 25.9089,
    lng: -80.3089,
    green_fee_min: 30,
    green_fee_max: 75,
    youth_programs: true,
    difficulty_rating: 3.7,
    equipment_rental: true,
    contact_info: {
      phone: "305-820-8106"
    }
  },
  {
    name: "Westchester Golf Course",
    address: "12250 SW 49th St, Miami, FL 33175",
    lat: 25.7223,
    lng: -80.3831,
    green_fee_min: 25,
    green_fee_max: 65,
    youth_programs: true,
    difficulty_rating: 3.4,
    equipment_rental: true,
    contact_info: {
      phone: "305-223-5961"
    }
  },
  {
    name: "Key West Golf Club",
    address: "6450 E College Rd, Key West, FL 33040",
    lat: 24.5465,
    lng: -81.7123,
    green_fee_min: 50,
    green_fee_max: 120,
    youth_programs: true,
    difficulty_rating: 4.0,
    equipment_rental: true,
    contact_info: {
      phone: "305-294-5232"
    },
    website: "https://keywestgolf.com/"
  }
];

async function seedCourses() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🌱 Starting to seed South Florida golf courses...');

  try {
    // Clear existing courses (optional)
    console.log('🧹 Clearing existing courses...');
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('⚠️  Warning: Could not clear existing courses:', deleteError.message);
    }

    // Insert new courses
    console.log('📍 Inserting courses...');
    const { data, error } = await supabase
      .from('courses')
      .insert(southFloridaCourses)
      .select();

    if (error) {
      console.error('❌ Error inserting courses:', error);
      process.exit(1);
    }

    console.log(`✅ Successfully seeded ${data?.length} golf courses!`);
    console.log('📊 Course breakdown:');

    const palmBeachCourses = data?.filter(course =>
      course.address.includes('Palm Beach') ||
      course.address.includes('Jupiter') ||
      course.address.includes('Boca')
    ).length || 0;

    const browardCourses = data?.filter(course =>
      course.address.includes('Plantation') ||
      course.address.includes('Hollywood') ||
      course.address.includes('Coral Springs') ||
      course.address.includes('Deerfield')
    ).length || 0;

    const miamiCourses = data?.filter(course =>
      course.address.includes('Miami') ||
      course.address.includes('Doral') ||
      course.address.includes('Key Biscayne')
    ).length || 0;

    console.log(`   🏌️ Palm Beach County: ${palmBeachCourses} courses`);
    console.log(`   🏌️ Broward County: ${browardCourses} courses`);
    console.log(`   🏌️ Miami-Dade County: ${miamiCourses} courses`);

    // Show some stats
    const youthProgramCourses = data?.filter(course => course.youth_programs).length || 0;
    const equipmentRentalCourses = data?.filter(course => course.equipment_rental).length || 0;

    console.log(`\n📈 Program Statistics:`);
    console.log(`   👦 Youth programs available: ${youthProgramCourses} courses`);
    console.log(`   🏌️ Equipment rental available: ${equipmentRentalCourses} courses`);

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCourses()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedCourses;