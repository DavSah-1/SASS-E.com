import { invokeLLM } from '../server/_core/llm.js';
import { drizzle } from 'drizzle-orm/mysql2';
import { vocabularyItems } from '../drizzle/schema.js';
import fs from 'fs/promises';

const db = drizzle(process.env.DATABASE_URL);

const LANGUAGES = [
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

const THEMES = [
  'greetings_basic', 'numbers', 'colors', 'time_dates',
  'food_drinks', 'fruits_vegetables', 'meals_cooking',
  'home_furniture', 'family_relationships', 'body_health',
  'clothes_accessories', 'shopping_money',
  'education_school', 'work_professions',
  'places_locations', 'travel_transportation',
  'weather_nature', 'animals_pets',
  'sports_hobbies', 'technology_communication',
  'emotions_feelings', 'common_verbs', 'common_adjectives'
];

async function generateVocabularyForLanguage(language, theme, wordsPerTheme = 15) {
  console.log(`  Generating ${wordsPerTheme} ${theme} words for ${language.name}...`);
  
  const prompt = `Generate ${wordsPerTheme} essential ${language.name} vocabulary words for the theme "${theme}".
Include a mix of beginner (60%), intermediate (30%), and advanced (10%) level words.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "word": "native word in ${language.name}",
    "translation": "English translation",
    "pronunciation": "phonetic pronunciation guide",
    "partOfSpeech": "noun/verb/adjective/adverb/etc",
    "difficulty": "beginner/intermediate/advanced",
    "exampleSentence": "Example sentence in ${language.name}",
    "exampleTranslation": "English translation of example",
    "contextNotes": "Brief cultural or usage note"
  }
]

Requirements:
- Use authentic ${language.name} words (in ${language.nativeName} script if applicable)
- Provide accurate phonetic pronunciations
- Include practical, commonly-used words
- Example sentences should be natural and useful
- Context notes should provide cultural insights or usage tips
- Ensure proper grammar and spelling in both languages

Return ONLY the JSON array, no additional text.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are an expert ${language.name} language teacher creating high-quality vocabulary learning materials. Provide accurate translations, pronunciations, and cultural context.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'vocabulary_list',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              words: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    word: { type: 'string' },
                    translation: { type: 'string' },
                    pronunciation: { type: 'string' },
                    partOfSpeech: { type: 'string' },
                    difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                    exampleSentence: { type: 'string' },
                    exampleTranslation: { type: 'string' },
                    contextNotes: { type: 'string' }
                  },
                  required: ['word', 'translation', 'pronunciation', 'partOfSpeech', 'difficulty', 'exampleSentence', 'exampleTranslation', 'contextNotes'],
                  additionalProperties: false
                }
              }
            },
            required: ['words'],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    const data = JSON.parse(content);
    
    // Add language code and theme to each word
    const words = data.words.map(word => ({
      language: language.code,
      theme,
      ...word
    }));
    
    console.log(`    ✓ Generated ${words.length} words`);
    return words;
    
  } catch (error) {
    console.error(`    ✗ Error generating ${theme} for ${language.name}:`, error.message);
    return [];
  }
}

async function generateAllVocabulary() {
  console.log('🌍 Starting comprehensive vocabulary generation...\n');
  
  const allVocabulary = [];
  let totalWords = 0;
  
  for (const language of LANGUAGES) {
    console.log(`\n📚 Generating vocabulary for ${language.name} (${language.nativeName})...`);
    const languageVocab = [];
    
    // Generate words for each theme
    for (const theme of THEMES) {
      const words = await generateVocabularyForLanguage(language, theme, 15);
      languageVocab.push(...words);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n  ✅ Total for ${language.name}: ${languageVocab.length} words`);
    allVocabulary.push(...languageVocab);
    totalWords += languageVocab.length;
    
    // Save intermediate results
    const filename = `vocabulary-${language.code}-generated.json`;
    await fs.writeFile(
      filename,
      JSON.stringify(languageVocab, null, 2),
      'utf-8'
    );
    console.log(`  💾 Saved to ${filename}`);
  }
  
  console.log(`\n\n🎉 GENERATION COMPLETE!`);
  console.log(`📊 Total vocabulary generated: ${totalWords} words`);
  console.log(`📈 Average per language: ${Math.round(totalWords / LANGUAGES.length)} words`);
  
  return allVocabulary;
}

async function seedDatabase(vocabulary) {
  console.log(`\n\n💾 Seeding database with ${vocabulary.length} words...`);
  
  try {
    // Insert in batches of 100 to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < vocabulary.length; i += batchSize) {
      const batch = vocabulary.slice(i, i + batchSize);
      await db.insert(vocabularyItems).values(batch);
      console.log(`  ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vocabulary.length / batchSize)}`);
    }
    
    console.log(`\n✅ Database seeded successfully!`);
  } catch (error) {
    console.error(`\n❌ Error seeding database:`, error.message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const vocabulary = await generateAllVocabulary();
    await seedDatabase(vocabulary);
    
    console.log(`\n\n🎊 ALL DONE! Your language learning platform now has ${vocabulary.length} vocabulary words!`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
