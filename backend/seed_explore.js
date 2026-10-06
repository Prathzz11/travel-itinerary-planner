require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const templates = require('./data/exploreTemplates');
async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await mongoose.connect(process.env.MONGO_URI);
  try {
    let inserted = 0;
    const refresh = process.argv.includes('--refresh-curated');
    for (const template of templates) {
      const result = await Template.updateOne(
        { title: template.title, authorName: template.authorName, author: { $exists: false } },
        { [refresh ? '$set' : '$setOnInsert']: template }, { upsert: true, runValidators: true });
      inserted += result.upsertedCount;
    }
    console.log(`Added ${inserted} public templates; ${templates.length - inserted} already existed${refresh ? ' and were refreshed' : ''}.`);
  } finally { await mongoose.disconnect(); }
}
seed().catch(error => { console.error(error.message); process.exitCode = 1; });
