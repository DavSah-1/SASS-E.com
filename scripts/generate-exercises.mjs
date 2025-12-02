import { invokeLLM } from '../server/_core/llm.js';
import { drizzle } from 'drizzle-orm/mysql2';
import { languageExercises } from '../drizzle/schema.js';
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

const EXERCISE_TYPES = ['translation', 'fill_in_blank', 'multiple_choice'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

// Generate exercises for each type and difficulty
const EXERCISES_PER_TYPE_DIFFICULTY = 12; // 12 exercises × 3 types × 3 difficulties = 108 per language

async function generateExercisesForLanguage(language) {
  console.log(`\n📚 Generating exercises for ${language.name} (${language.nativeName})...`);
  
  const allExercises = [];
  
  for (const exerciseType of EXERCISE_TYPES) {
    for (const difficulty of DIFFICULTIES) {
      console.log(`  Generating ${EXERCISES_PER_TYPE_DIFFICULTY} ${exerciseType} exercises (${difficulty})...`);
      
      const prompt = `Generate ${EXERCISES_PER_TYPE_DIFFICULTY} ${language.name} language learning exercises.

Exercise Type: ${exerciseType}
Difficulty Level: ${difficulty}
Target Language: ${language.name} (${language.nativeName})

Requirements:
1. Each exercise must be appropriate for ${difficulty} level learners
2. Include clear instructions in English
3. For translation exercises: provide an English sentence to translate to ${language.name}
4. For fill_in_blank exercises: provide a ${language.name} sentence with ONE blank (use ___ for the blank) and the correct word to fill in
5. For multiple_choice exercises: provide a ${language.name} question and 4 answer options (one correct, three plausible distractors)
6. Include helpful hints when appropriate
7. Add Bob's sarcastic feedback for both correct and incorrect answers
8. Ensure cultural appropriateness and real-world relevance

Generate exactly ${EXERCISES_PER_TYPE_DIFFICULTY} exercises in valid JSON format.`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: 'system',
              content: 'You are an expert language teacher creating educational exercises. Generate high-quality, pedagogically sound exercises with Bob\'s signature sarcastic personality in the feedback.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'language_exercises',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        question: { type: 'string', description: 'The exercise question or prompt' },
                        correctAnswer: { type: 'string', description: 'The correct answer' },
                        options: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'For multiple choice: array of 4 options. For others: empty array',
                        },
                        hint: { type: 'string', description: 'Optional hint to help the learner' },
                        explanation: { type: 'string', description: 'Explanation of the correct answer' },
                        correctFeedback: { type: 'string', description: 'Bob\'s sarcastic feedback for correct answer' },
                        incorrectFeedback: { type: 'string', description: 'Bob\'s sarcastic feedback for incorrect answer' },
                      },
                      required: ['question', 'correctAnswer', 'options', 'hint', 'explanation', 'correctFeedback', 'incorrectFeedback'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['exercises'],
                additionalProperties: false,
              },
            },
          },
        });

        const result = JSON.parse(response.choices[0].message.content);
        
        // Add metadata to each exercise
        result.exercises.forEach(exercise => {
          allExercises.push({
            language: language.code,
            exerciseType: exerciseType === 'fill_in_blank' ? 'fill_blank' : exerciseType,
            difficulty,
            prompt: exercise.question, // The prompt/question field
            correctAnswer: exercise.correctAnswer,
            options: exercise.options.length > 0 ? JSON.stringify(exercise.options) : null,
            explanation: exercise.explanation,
            // Note: correctFeedback and incorrectFeedback are not in schema, will be generated dynamically
          });
        });
        
        console.log(`    ✓ Generated ${result.exercises.length} exercises`);
        
      } catch (error) {
        console.error(`    ❌ Error generating ${exerciseType} ${difficulty} exercises:`, error.message);
      }
    }
  }
  
  console.log(`  ✅ Total for ${language.name}: ${allExercises.length} exercises`);
  
  // Save to JSON file
  const filename = `exercises-${language.code}-generated.json`;
  await fs.writeFile(filename, JSON.stringify(allExercises, null, 2));
  console.log(`  💾 Saved to ${filename}`);
  
  return allExercises;
}

async function seedDatabase(exercises) {
  console.log(`\n📊 Seeding database with ${exercises.length} exercises...`);
  
  const batchSize = 50;
  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize);
    await db.insert(languageExercises).values(batch);
    console.log(`  ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(exercises.length / batchSize)}`);
  }
  
  console.log(`  ✅ Database seeding complete!`);
}

async function main() {
  console.log('🎯 Starting Exercise Generation for All Languages...\n');
  console.log(`Languages: ${LANGUAGES.length}`);
  console.log(`Exercise Types: ${EXERCISE_TYPES.join(', ')}`);
  console.log(`Difficulties: ${DIFFICULTIES.join(', ')}`);
  console.log(`Exercises per language: ${EXERCISES_PER_TYPE_DIFFICULTY * EXERCISE_TYPES.length * DIFFICULTIES.length}`);
  console.log(`Total exercises to generate: ${LANGUAGES.length * EXERCISES_PER_TYPE_DIFFICULTY * EXERCISE_TYPES.length * DIFFICULTIES.length}\n`);
  
  const allExercises = [];
  
  for (const language of LANGUAGES) {
    const exercises = await generateExercisesForLanguage(language);
    allExercises.push(...exercises);
  }
  
  console.log(`\n🎉 GENERATION COMPLETE!`);
  console.log(`📊 Total exercises generated: ${allExercises.length}`);
  
  // Seed database
  await seedDatabase(allExercises);
  
  console.log(`\n✅ ALL DONE! ${allExercises.length} exercises generated and seeded.`);
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
