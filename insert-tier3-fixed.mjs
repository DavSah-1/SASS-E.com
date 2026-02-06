import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const articles = JSON.parse(readFileSync('/home/ubuntu/tier3-articles-content.json', 'utf8'));
const quizzes = JSON.parse(readFileSync('/home/ubuntu/tier3-quizzes.json', 'utf8'));
const assessment = JSON.parse(readFileSync('/home/ubuntu/tier3-mastery-assessment.json', 'utf8'));

async function insertTier3Content() {
  console.log('Inserting Tier 3 articles...');
  const { data: articleData, error: articleError } = await supabase
    .from('finance_articles')
    .insert(articles)
    .select();
  
  if (articleError) {
    console.error('Error inserting articles:', articleError);
    return;
  } else {
    console.log(`✅ Inserted ${articleData.length} Tier 3 articles`);
  }

  // Create a map of slug to article ID
  const slugToId = {};
  for (const article of articleData) {
    slugToId[article.slug] = article.id;
  }

  console.log('\nInserting Tier 3 quizzes...');
  const quizzesWithArticleIds = quizzes.map(quiz => ({
    article_id: slugToId[quiz.articleSlug],
    questions: quiz.questions
  }));

  const { data: quizData, error: quizError } = await supabase
    .from('article_quizzes')
    .insert(quizzesWithArticleIds)
    .select();
  
  if (quizError) {
    console.error('Error inserting quizzes:', quizError);
  } else {
    console.log(`✅ Inserted ${quizData.length} Tier 3 quizzes (60 total questions)`);
  }

  console.log('\nInserting Tier 3 Mastery Assessment...');
  const { data: assessmentData, error: assessmentError } = await supabase
    .from('tier_assessments')
    .insert({
      tier_id: assessment.tier_id,
      title: assessment.title,
      description: assessment.description,
      pass_rate: assessment.pass_percentage,
      questions: assessment.questions
    })
    .select();
  
  if (assessmentError) {
    console.error('Error inserting assessment:', assessmentError);
  } else {
    console.log(`✅ Inserted Tier 3 Mastery Assessment (10 questions)`);
  }

  console.log('\n🎉 Tier 3 content insertion complete!');
}

insertTier3Content().catch(console.error);
