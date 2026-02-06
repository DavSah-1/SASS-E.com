import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertQuizzesAndAssessment() {
  try {
    console.log('Fetching existing Tier 2 articles...');
    
    const { data: articles, error: fetchError } = await supabase
      .from('finance_articles')
      .select('id, slug')
      .in('slug', [
        'emergency-fund-fundamentals',
        'types-of-insurance',
        'retirement-account-basics',
        'employer-benefits',
        'building-credit-history',
        'debt-consolidation',
        'savings-account-types',
        'financial-goal-setting'
      ]);

    if (fetchError) {
      console.error('Error fetching articles:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${articles.length} Tier 2 articles`);

    const slugToId = {};
    articles.forEach(article => {
      slugToId[article.slug] = article.id;
    });

    const quizzes = JSON.parse(readFileSync('/home/ubuntu/tier2-quizzes.json', 'utf-8'));
    
    console.log('Inserting quizzes for 8 articles...');
    let totalArticlesWithQuizzes = 0;

    for (const quiz of quizzes) {
      const articleId = slugToId[quiz.article_slug];
      if (!articleId) {
        console.warn(`Warning: Article slug "${quiz.article_slug}" not found, skipping quiz`);
        continue;
      }

      const { data, error } = await supabase
        .from('article_quizzes')
        .insert({
          article_id: articleId,
          questions: quiz.questions
        });

      if (error) {
        console.error(`Error inserting quiz for ${quiz.article_slug}:`, error);
        throw error;
      }

      totalArticlesWithQuizzes++;
      console.log(`  ✅ Inserted quiz with ${quiz.questions.length} questions for ${quiz.article_slug}`);
    }

    console.log(`✅ Inserted quizzes for ${totalArticlesWithQuizzes} articles (40 total questions)`);

    const assessment = JSON.parse(readFileSync('/home/ubuntu/tier2-mastery-assessment.json', 'utf-8'));
    
    console.log('Inserting Tier 2 Mastery Assessment...');
    
    const assessmentQuestions = assessment.questions.map((q, index) => ({
      tier_id: assessment.tier_id,
      question_order: index + 1,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation_correct: q.explanation_correct,
      explanation_incorrect: q.explanation_incorrect
    }));

    const { data: assessmentData, error: assessmentError } = await supabase
      .from('tier_assessments')
      .insert(assessmentQuestions);

    if (assessmentError) {
      console.error('Error inserting Tier 2 assessment:', assessmentError);
      throw assessmentError;
    }

    console.log(`✅ Inserted ${assessmentQuestions.length} Tier 2 assessment questions`);

    console.log('\n🎉 All Tier 2 quizzes and assessment inserted successfully!');
    console.log('Summary:');
    console.log(`  - ${totalArticlesWithQuizzes} quizzes (40 total questions)`);
    console.log(`  - ${assessmentQuestions.length} Tier 2 assessment questions`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

insertQuizzesAndAssessment();
