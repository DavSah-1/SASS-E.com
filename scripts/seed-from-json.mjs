import { drizzle } from 'drizzle-orm/mysql2';
import { vocabularyItems } from '../drizzle/schema.js';
import fs from 'fs/promises';
import path from 'path';

const db = drizzle(process.env.DATABASE_URL);

const LANGUAGE_FILES = [
  'vocabulary-es-generated.json',
  'vocabulary-fr-generated.json',
  'vocabulary-de-generated.json',
  'vocabulary-it-generated.json',
  'vocabulary-pt-generated.json',
  'vocabulary-ja-generated.json',
  'vocabulary-zh-generated.json',
  'vocabulary-ko-generated.json',
  'vocabulary-ru-generated.json',
  'vocabulary-ar-generated.json',
];

async function seedDatabase() {
  console.log('🌍 Seeding database from generated JSON files...\n');
  
  let totalInserted = 0;
  
  for (const filename of LANGUAGE_FILES) {
    try {
      const filePath = path.join(process.cwd(), filename);
      const content = await fs.readFile(filePath, 'utf-8');
      const vocabulary = JSON.parse(content);
      
      console.log(`📚 Processing ${filename}...`);
      console.log(`  Words to insert: ${vocabulary.length}`);
      
      // Prepare vocabulary items for insertion
      const items = vocabulary.map(item => ({
        language: item.language,
        word: item.word,
        translation: item.translation,
        pronunciation: item.pronunciation || null,
        partOfSpeech: item.partOfSpeech,
        difficulty: item.difficulty,
        category: item.theme || null,
        exampleSentence: item.exampleSentence || null,
        exampleTranslation: item.exampleTranslation || null,
        notes: item.contextNotes || null,
      }));
      
      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        await db.insert(vocabularyItems).values(batch);
        console.log(`  ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
      }
      
      totalInserted += items.length;
      console.log(`  ✅ Completed ${filename}: ${items.length} words\n`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${filename}:`, error.message);
    }
  }
  
  console.log(`\n🎉 DATABASE SEEDING COMPLETE!`);
  console.log(`📊 Total words inserted: ${totalInserted}`);
  
  process.exit(0);
}

seedDatabase().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
