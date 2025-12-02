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

async function transformAndSeed() {
  console.log('📊 Transforming and seeding exercises from JSON files...\n');
  
  let totalExercises = 0;
  
  for (const language of LANGUAGES) {
    const filename = `exercises-${language.code}-generated.json`;
    
    try {
      const data = await fs.readFile(filename, 'utf-8');
      const rawExercises = JSON.parse(data);
      
      console.log(`  Loading ${language.name} exercises from ${filename}...`);
      console.log(`    Found ${rawExercises.length} exercises to transform`);
      
      // Transform to match database schema
      const transformedExercises = rawExercises.map(ex => ({
        language: ex.language,
        exerciseType: ex.exerciseType === 'fill_in_blank' ? 'fill_blank' : ex.exerciseType,
        difficulty: ex.difficulty,
        prompt: ex.question, // Map 'question' to 'prompt'
        correctAnswer: ex.correctAnswer,
        options: ex.options, // Already JSON string or null
        explanation: ex.explanation,
        // Note: correctFeedback and incorrectFeedback will be generated dynamically in the UI
      }));
      
      // Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < transformedExercises.length; i += batchSize) {
        const batch = transformedExercises.slice(i, i + batchSize);
        await db.insert(languageExercises).values(batch);
        console.log(`    ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transformedExercises.length / batchSize)}`);
      }
      
      console.log(`  ✅ ${language.name}: ${transformedExercises.length} exercises seeded`);
      totalExercises += transformedExercises.length;
      
    } catch (error) {
      console.error(`  ❌ Error seeding ${language.name}:`, error.message);
    }
  }
  
  console.log(`\n🎉 SEEDING COMPLETE! ${totalExercises} exercises added to database.`);
  process.exit(0);
}

transformAndSeed().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
