import { drizzle } from 'drizzle-orm/mysql2';
import { languageExercises } from '../drizzle/schema.js';
import fs from 'fs/promises';

const db = drizzle(process.env.DATABASE_URL);

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
];

async function seedFromJSON() {
  console.log('📊 Seeding exercises from JSON files...\n');
  
  let totalExercises = 0;
  
  for (const language of LANGUAGES) {
    const filename = `exercises-${language.code}-generated.json`;
    
    try {
      const data = await fs.readFile(filename, 'utf-8');
      const exercises = JSON.parse(data);
      
      console.log(`  Loading ${language.name} exercises from ${filename}...`);
      
      // Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < exercises.length; i += batchSize) {
        const batch = exercises.slice(i, i + batchSize);
        await db.insert(languageExercises).values(batch);
        console.log(`    ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(exercises.length / batchSize)}`);
      }
      
      console.log(`  ✅ ${language.name}: ${exercises.length} exercises seeded`);
      totalExercises += exercises.length;
      
    } catch (error) {
      console.error(`  ❌ Error seeding ${language.name}:`, error.message);
    }
  }
  
  console.log(`\n🎉 SEEDING COMPLETE! ${totalExercises} exercises added to database.`);
  process.exit(0);
}

seedFromJSON().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
