// South Florida Golf Courses Seed Data
// Real courses across Palm Beach, Broward, and Miami-Dade Counties

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

  // Additional Notable Courses
  {
    name: "PGA National Champion Course",
    address: "400 Avenue of the Champions, Palm Beach Gardens, FL 33418",
    lat: 26.8622,
    lng: -80.1123,
    green_fee_min: 150,
    green_fee_max: 400,
    youth_programs: false,
    difficulty_rating: 4.9,
    equipment_rental: true,
    contact_info: {
      phone: "561-627-2000"
    }
  },
  {
    name: "Seminole Golf Club",
    address: "901 Donald Ross Rd, Juno Beach, FL 33408",
    lat: 26.8922,
    lng: -80.0531,
    green_fee_min: 200,
    green_fee_max: 500,
    youth_programs: false,
    difficulty_rating: 4.8,
    equipment_rental: false,
    contact_info: {
      phone: "561-626-2744"
    }
  },
  {
    name: "Jupiter Hills Club",
    address: "2700 SE Lakeview Dr, Jupiter, FL 33469",
    lat: 26.9342,
    lng: -80.0947,
    green_fee_min: 100,
    green_fee_max: 250,
    youth_programs: false,
    difficulty_rating: 4.4,
    equipment_rental: true,
    contact_info: {
      phone: "561-746-1262"
    }
  },
  {
    name: "Ibis Golf & Country Club",
    address: "8851 Ibis Boulevard West Palm Beach, FL 33412",
    lat: 26.8297,
    lng: -80.1748,
    green_fee_min: 60,
    green_fee_max: 140,
    youth_programs: false,
    difficulty_rating: 4.1,
    equipment_rental: true,
    contact_info: {
      phone: "561-625-8500"
    }
  },
  {
    name: "Mizner Country Club",
    address: "8251 Linton Boulevard Delray Beach, FL 33446",
    lat: 26.4734,
    lng: -80.1748,
    green_fee_min: 75,
    green_fee_max: 160,
    youth_programs: false,
    difficulty_rating: 4.2,
    equipment_rental: true,
    contact_info: {
      phone: "561-495-4500"
    }
  }
];

module.exports = southFloridaCourses;