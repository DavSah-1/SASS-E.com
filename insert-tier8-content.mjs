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
      excerpt: article.excerpt,
      content: article.content,
      readTime: article.readTime,
      published: true
    });
  
  if (error) {
    console.error(`Error inserting article "${article.title}":`, error);
  } else {
    console.log(`✓ Inserted article: ${article.title}`);
  }
}

console.log(`\nInserting ${quizzes.length} article quizzes...`);

// Insert quizzes
for (const quiz of quizzes) {
  const { data, error } = await supabase
    .from('article_quizzes')
    .insert({
      articleSlug: quiz.article_slug,
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
    tier: assessment.tier,
    title: assessment.title,
    description: assessment.description,
    passingScore: assessment.passing_score,
    questions: assessment.questions
  });

if (assessmentError) {
  console.error('Error inserting Tier 8 assessment:', assessmentError);
} else {
  console.log('✓ Inserted Tier 8 Mastery Assessment');
}

console.log('\n✅ Tier 8 content insertion complete!');
