import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read JSON files
const articles = JSON.parse(fs.readFileSync('/home/ubuntu/tier7-articles-full.json', 'utf8'));
const quizzes = JSON.parse(fs.readFileSync('/home/ubuntu/tier7-quizzes.json', 'utf8'));
const assessment = JSON.parse(fs.readFileSync('/home/ubuntu/tier7-mastery-assessment.json', 'utf8'));

async function insertTier7Content() {
  console.log('Starting Tier 7 content insertion...');

  // Insert articles
  console.log('\nInserting articles...');
  for (const article of articles) {
    const { data, error } = await supabase
      .from('finance_articles')
      .insert({
        tier_id: 7,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        difficulty: article.difficulty,
        readTime: article.readTime,
        order_index: articles.indexOf(article)
      });

    if (error) {
      console.error(`Error inserting article "${article.title}":`, error);
    } else {
      console.log(`✓ Inserted article: ${article.title}`);
    }
  }

  // Insert quizzes
  console.log('\nInserting quizzes...');
  for (const articleQuiz of quizzes) {
    for (const question of articleQuiz.questions) {
      const { data, error } = await supabase
        .from('article_quizzes')
        .insert({
          article_slug: articleQuiz.article_slug,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation
        });

      if (error) {
        console.error(`Error inserting quiz for ${articleQuiz.article_slug}:`, error);
      } else {
        console.log(`✓ Inserted quiz question for: ${articleQuiz.article_slug}`);
      }
    }
  }

  // Insert tier assessment
  console.log('\nInserting Tier 7 Mastery Assessment...');
  for (const question of assessment.questions) {
    const { data, error } = await supabase
      .from('tier_assessments')
      .insert({
        tier_id: assessment.tier_id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
      });

    if (error) {
      console.error('Error inserting assessment question:', error);
    } else {
      console.log(`✓ Inserted assessment question`);
    }
  }

  console.log('\n✅ Tier 7 content insertion complete!');
  console.log(`   - ${articles.length} articles`);
  console.log(`   - ${quizzes.reduce((sum, q) => sum + q.questions.length, 0)} quiz questions`);
  console.log(`   - ${assessment.questions.length} assessment questions`);
}

insertTier7Content().catch(console.error);
