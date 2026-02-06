import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Read article files
const articles1 = JSON.parse(readFileSync('/home/ubuntu/tier8-articles-full.json', 'utf8'));
const articles2 = JSON.parse(readFileSync('/home/ubuntu/tier8-articles-part2.json', 'utf8'));
const allArticles = [...articles1, ...articles2];

// Read quizzes and assessment
const quizzes = JSON.parse(readFileSync('/home/ubuntu/tier8-quizzes.json', 'utf8'));
const assessment = JSON.parse(readFileSync('/home/ubuntu/tier8-mastery-assessment.json', 'utf8'));

console.log(`Inserting ${allArticles.length} Tier 8 articles...`);

// Insert articles
for (const article of allArticles) {
  const { data, error } = await supabase
    .from('finance_articles')
    .insert({
      title: article.title,
      slug: article.slug,
      summary: article.excerpt,  // Use 'summary' not 'excerpt'
      content: article.content,
      readTime: article.readTime,
      difficulty: 'advanced',
      published: 'true'
    });
  
  if (error) {
    console.error(`Error inserting article "${article.title}":`, error);
  } else {
    console.log(`✓ Inserted article: ${article.title}`);
  }
}

// Fetch article IDs for quiz insertion
const { data: articleData, error: fetchError } = await supabase
  .from('finance_articles')
  .select('id, slug')
  .in('slug', allArticles.map(a => a.slug));

if (fetchError) {
  throw new Error(`Failed to fetch articles: ${fetchError.message}`);
}

const slugToId = {};
articleData.forEach(article => {
  slugToId[article.slug] = article.id;
});

console.log(`\nInserting ${quizzes.length} article quizzes...`);

// Insert quizzes
for (const quiz of quizzes) {
  const articleId = slugToId[quiz.article_slug];
  if (!articleId) {
    console.error(`Could not find article ID for slug: ${quiz.article_slug}`);
    continue;
  }

  const { data, error} = await supabase
    .from('article_quizzes')
    .insert({
      article_id: articleId,  // Use 'article_id' not 'articleSlug'
      questions: quiz.questions
    });
  
  if (error) {
    console.error(`Error inserting quiz for "${quiz.article_slug}":`, error);
  } else {
    console.log(`✓ Inserted quiz for: ${quiz.article_slug}`);
  }
}

console.log(`\nInserting Tier 8 Mastery Assessment...`);

// Insert assessment
const { data: assessmentData, error: assessmentError } = await supabase
  .from('tier_assessments')
  .insert({
    tier_id: assessment.tier,  // Use 'tier_id' not 'tier'
    title: assessment.title,
    description: assessment.description,
    pass_rate: assessment.passing_score,  // Use 'pass_rate' not 'passing_score'
    questions: assessment.questions
  });

if (assessmentError) {
  console.error('Error inserting Tier 8 assessment:', assessmentError);
} else {
  console.log('✓ Inserted Tier 8 Mastery Assessment');
}

console.log('\n✅ Tier 8 content insertion complete!');
