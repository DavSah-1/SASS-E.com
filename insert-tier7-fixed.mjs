import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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
  const insertedArticles = [];
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
        read_time: article.readTime,
        order_index: articles.indexOf(article),
        published: 'true'
      })
      .select();

    if (error) {
      console.error(`Error inserting article "${article.title}":`, error);
    } else {
      console.log(`✓ Inserted article: ${article.title} (ID: ${data[0].id})`);
      insertedArticles.push({ slug: article.slug, id: data[0].id });
    }
  }

  // Insert quizzes (one row per article with all questions in JSONB)
  console.log('\nInserting quizzes...');
  for (const articleQuiz of quizzes) {
    // Find the article ID by slug
    const article = insertedArticles.find(a => a.slug === articleQuiz.article_slug);
    if (!article) {
      console.error(`Could not find article with slug: ${articleQuiz.article_slug}`);
      continue;
    }

    const { data, error } = await supabase
      .from('article_quizzes')
      .insert({
        article_id: article.id,
        questions: articleQuiz.questions // Store all questions as JSONB array
      });

    if (error) {
      console.error(`Error inserting quiz for ${articleQuiz.article_slug}:`, error);
    } else {
      console.log(`✓ Inserted quiz (${articleQuiz.questions.length} questions) for: ${articleQuiz.article_slug}`);
    }
  }

  // Insert tier assessment (one row with all questions in JSONB)
  console.log('\nInserting Tier 7 Mastery Assessment...');
  const { data: assessmentData, error: assessmentError } = await supabase
    .from('tier_assessments')
    .insert({
      tier_id: assessment.tier_id,
      title: assessment.title,
      description: assessment.description,
      questions: assessment.questions, // Store all questions as JSONB array
      pass_rate: assessment.pass_rate
    });

  if (assessmentError) {
    console.error('Error inserting assessment:', assessmentError);
  } else {
    console.log(`✓ Inserted Tier 7 Mastery Assessment (${assessment.questions.length} questions)`);
  }

  console.log('\n✅ Tier 7 content insertion complete!');
  console.log(`   - ${articles.length} articles`);
  console.log(`   - ${quizzes.length} article quizzes (${quizzes.reduce((sum, q) => sum + q.questions.length, 0)} total questions)`);
  console.log(`   - 1 tier assessment (${assessment.questions.length} questions)`);
}

insertTier7Content().catch(console.error);
