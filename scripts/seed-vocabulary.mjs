import { drizzle } from 'drizzle-orm/mysql2';
import { vocabularyItems } from '../drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);

const spanishVocabulary = [
  {
    language: 'es',
    word: 'hola',
    translation: 'hello',
    pronunciation: 'OH-lah',
    partOfSpeech: 'interjection',
    difficulty: 'beginner',
    exampleSentence: '¡Hola! ¿Cómo estás?',
    exampleTranslation: 'Hello! How are you?',
    contextNotes: 'Common greeting used at any time of day',
  },
  {
    language: 'es',
    word: 'gracias',
    translation: 'thank you',
    pronunciation: 'GRAH-see-ahs',
    partOfSpeech: 'interjection',
    difficulty: 'beginner',
    exampleSentence: 'Muchas gracias por tu ayuda.',
    exampleTranslation: 'Thank you very much for your help.',
    contextNotes: 'Essential polite expression',
  },
  {
    language: 'es',
    word: 'casa',
    translation: 'house',
    pronunciation: 'KAH-sah',
    partOfSpeech: 'noun',
    difficulty: 'beginner',
    exampleSentence: 'Mi casa es grande.',
    exampleTranslation: 'My house is big.',
    contextNotes: 'Feminine noun (la casa)',
  },
  {
    language: 'es',
    word: 'agua',
    translation: 'water',
    pronunciation: 'AH-gwah',
    partOfSpeech: 'noun',
    difficulty: 'beginner',
    exampleSentence: 'Necesito un vaso de agua.',
    exampleTranslation: 'I need a glass of water.',
    contextNotes: 'Feminine noun but uses "el" (el agua) due to stressed "a"',
  },
  {
    language: 'es',
    word: 'comer',
    translation: 'to eat',
    pronunciation: 'koh-MEHR',
    partOfSpeech: 'verb',
    difficulty: 'beginner',
    exampleSentence: 'Me gusta comer pizza.',
    exampleTranslation: 'I like to eat pizza.',
    contextNotes: 'Regular -er verb',
  },
  {
    language: 'es',
    word: 'libro',
    translation: 'book',
    pronunciation: 'LEE-broh',
    partOfSpeech: 'noun',
    difficulty: 'beginner',
    exampleSentence: 'Estoy leyendo un libro interesante.',
    exampleTranslation: 'I am reading an interesting book.',
    contextNotes: 'Masculine noun (el libro)',
  },
  {
    language: 'es',
    word: 'amigo',
    translation: 'friend',
    pronunciation: 'ah-MEE-goh',
    partOfSpeech: 'noun',
    difficulty: 'beginner',
    exampleSentence: 'Mi mejor amigo se llama Carlos.',
    exampleTranslation: 'My best friend is named Carlos.',
    contextNotes: 'Masculine form; feminine is "amiga"',
  },
  {
    language: 'es',
    word: 'trabajar',
    translation: 'to work',
    pronunciation: 'trah-bah-HAHR',
    partOfSpeech: 'verb',
    difficulty: 'beginner',
    exampleSentence: 'Trabajo en una oficina.',
    exampleTranslation: 'I work in an office.',
    contextNotes: 'Regular -ar verb',
  },
  {
    language: 'es',
    word: 'hermoso',
    translation: 'beautiful',
    pronunciation: 'ehr-MOH-soh',
    partOfSpeech: 'adjective',
    difficulty: 'intermediate',
    exampleSentence: 'Qué día tan hermoso.',
    exampleTranslation: 'What a beautiful day.',
    contextNotes: 'Changes to "hermosa" for feminine nouns',
  },
  {
    language: 'es',
    word: 'aprender',
    translation: 'to learn',
    pronunciation: 'ah-prehn-DEHR',
    partOfSpeech: 'verb',
    difficulty: 'beginner',
    exampleSentence: 'Quiero aprender español.',
    exampleTranslation: 'I want to learn Spanish.',
    contextNotes: 'Regular -er verb',
  },
  {
    language: 'es',
    word: 'feliz',
    translation: 'happy',
    pronunciation: 'feh-LEES',
    partOfSpeech: 'adjective',
    difficulty: 'beginner',
    exampleSentence: 'Estoy muy feliz hoy.',
    exampleTranslation: 'I am very happy today.',
    contextNotes: 'Same form for masculine and feminine',
  },
  {
    language: 'es',
    word: 'tiempo',
    translation: 'time / weather',
    pronunciation: 'tee-EHM-poh',
    partOfSpeech: 'noun',
    difficulty: 'intermediate',
    exampleSentence: 'No tengo tiempo ahora.',
    exampleTranslation: 'I don\'t have time now.',
    contextNotes: 'Can mean both "time" and "weather" depending on context',
  },
  {
    language: 'es',
    word: 'ciudad',
    translation: 'city',
    pronunciation: 'see-oo-DAHD',
    partOfSpeech: 'noun',
    difficulty: 'beginner',
    exampleSentence: 'Madrid es una ciudad grande.',
    exampleTranslation: 'Madrid is a big city.',
    contextNotes: 'Feminine noun (la ciudad)',
  },
  {
    language: 'es',
    word: 'importante',
    translation: 'important',
    pronunciation: 'eem-por-TAHN-teh',
    partOfSpeech: 'adjective',
    difficulty: 'intermediate',
    exampleSentence: 'Es muy importante estudiar.',
    exampleTranslation: 'It is very important to study.',
    contextNotes: 'Same form for masculine and feminine',
  },
  {
    language: 'es',
    word: 'siempre',
    translation: 'always',
    pronunciation: 'see-EHM-preh',
    partOfSpeech: 'adverb',
    difficulty: 'beginner',
    exampleSentence: 'Siempre llego a tiempo.',
    exampleTranslation: 'I always arrive on time.',
    contextNotes: 'Common adverb of frequency',
  },
];

async function seedVocabulary() {
  console.log('🌱 Seeding vocabulary data...');
  
  try {
    // Insert all vocabulary items
    await db.insert(vocabularyItems).values(spanishVocabulary);
    
    console.log(`✅ Successfully seeded ${spanishVocabulary.length} Spanish vocabulary items!`);
    console.log('📚 Vocabulary words added:');
    spanishVocabulary.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.word} - ${item.translation} (${item.difficulty})`);
    });
  } catch (error) {
    console.error('❌ Error seeding vocabulary:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedVocabulary();
