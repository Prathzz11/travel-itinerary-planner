const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync');

const LOCATION_MAP = {
  // Tokyo Adventure & 2nd Tokyo trip
  'Arrive at Narita Airport':               'Narita International Airport, Narita, Chiba, Japan',
  'Shinjuku Gyoen Garden':                  'Shinjuku Gyoen National Garden, Naitomachi, Shinjuku City, Tokyo, Japan',
  'Meiji Shrine':                           'Meiji Jingu, Yoyogikamizonocho, Shibuya City, Tokyo, Japan',
  'Takeshita Street, Harajuku':             'Takeshita Street, Harajuku, Shibuya City, Tokyo, Japan',
  'Shibuya Crossing':                       'Shibuya Scramble Crossing, Shibuya City, Tokyo, Japan',
  'Tsukiji Outer Market Breakfast':         'Tsukiji Outer Market, Tsukiji, Chuo City, Tokyo, Japan',
  'teamLab Planets':                        'teamLab Planets TOKYO DMM, Toyosu, Koto City, Tokyo, Japan',
  'Check-in to Hotel':                      'Shinjuku, Tokyo, Japan',
  'Shinjuku Gyoen National Garden':         'Shinjuku Gyoen National Garden, Naitomachi, Shinjuku City, Tokyo, Japan',
  'Tokyo Metropolitan Government Building': 'Tokyo Metropolitan Government Building, Nishishinjuku, Shinjuku City, Tokyo, Japan',
  'Omoide Yokocho':                         'Omoide Yokocho, Nishishinjuku, Shinjuku City, Tokyo, Japan',
  'Takeshita Street':                       'Takeshita Street, Harajuku, Shibuya City, Tokyo, Japan',
  'Shibuya Sky':                            'Shibuya Sky, Shibuya, Shibuya City, Tokyo, Japan',
  'Senso-ji Temple':                        'Senso-ji Temple, Asakusa, Taito City, Tokyo, Japan',
  'Nakamise Shopping Street':               'Nakamise Shopping Street, Asakusa, Taito City, Tokyo, Japan',
  'Ueno Park & Museums':                    'Ueno Park, Uenokoen, Taito City, Tokyo, Japan',
  'Ameyoko Market':                         'Ameyoko Market, Ueno, Taito City, Tokyo, Japan',
  'Akihabara Electric Town':                'Akihabara, Taito City, Tokyo, Japan',
  'Maid Cafe Experience':                   'Akihabara, Taito City, Tokyo, Japan',
  'Kanda Shrine':                           'Kanda Myojin Shrine, Sotokanda, Chiyoda City, Tokyo, Japan',
  'Tsukiji Outer Market':                   'Tsukiji Outer Market, Tsukiji, Chuo City, Tokyo, Japan',
  'Odaiba Seaside Park':                    'Odaiba Seaside Park, Odaiba, Minato City, Tokyo, Japan',
  'Romancecar to Hakone':                   'Shinjuku Station, Shinjuku City, Tokyo, Japan',
  'Hakone Ropeway & Owakudani':             'Owakudani, Hakone, Kanagawa, Japan',
  'Lake Ashi Sightseeing Cruise':           'Lake Ashi, Hakone, Kanagawa, Japan',
  'Onsen Experience':                       'Hakone, Kanagawa, Japan',
  'Roppongi Hills & Mori Art Museum':       'Roppongi Hills Mori Tower, Roppongi, Minato City, Tokyo, Japan',
  'Last Minute Shopping':                   'Shibuya, Tokyo, Japan',
  'Narita/Haneda Airport Express':          'Narita International Airport, Narita, Chiba, Japan',
  // Goa
  'Check-in to Beach Resort':               'Calangute Beach, North Goa, Goa, India',
  'Calangute Beach Sunset':                 'Calangute Beach, North Goa, Goa, India',
  'Water Sports at Baga Beach':             'Baga Beach, North Goa, Goa, India',
  'Seafood Dinner at Thalassa':             'Thalassa Restaurant, Vagator, North Goa, Goa, India',
  // Manali
  'Arrive Manali & Rest':                   'Manali, Himachal Pradesh, India',
  'Solang Valley':                          'Solang Valley, Manali, Himachal Pradesh, India',
  'Old Manali Cafes':                       'Old Manali, Manali, Himachal Pradesh, India',
  'Rohtang Pass':                           'Rohtang Pass, Himachal Pradesh, India',
};

// Normalize categories that were seeded with invalid values
const CATEGORY_FIX = {
  'Logistics': 'Other',
  'Nature':    'Sightseeing',
  'Culture':   'Sightseeing',
  'Transit':   'Transport',
  'Relaxation':'Other',
};

const db = mongoose.connection;
db.once('open', async () => {
  const Itineraries = db.collection('itineraries');
  const docs = await Itineraries.find({}).toArray();
  let totalLocations = 0;
  let totalCategories = 0;

  for (const doc of docs) {
    const updatedDays = doc.days.map(day => ({
      ...day,
      activities: day.activities.map(act => {
        const name = act.name || act.title || '';
        const updated = { ...act };

        // Fix location
        if (!act.location && LOCATION_MAP[name]) {
          updated.location = LOCATION_MAP[name];
          totalLocations++;
          console.log(`✓ Location set: "${name}"`);
        }

        // Fix invalid category
        if (CATEGORY_FIX[act.category]) {
          console.log(`  ↳ Category "${act.category}" → "${CATEGORY_FIX[act.category]}" for "${name}"`);
          updated.category = CATEGORY_FIX[act.category];
          totalCategories++;
        }

        return updated;
      })
    }));

    await Itineraries.updateOne(
      { _id: doc._id },
      { $set: { days: updatedDays } }
    );
  }

  console.log(`\n✅ Done! Set ${totalLocations} locations and fixed ${totalCategories} invalid categories.`);
  process.exit(0);
});
