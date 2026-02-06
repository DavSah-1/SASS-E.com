import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTier2Content() {
  try {
    console.log('Starting Tier 2 content insertion...');

    // Read JSON files
    const articles = JSON.parse(readFileSync('/home/ubuntu/tier2-articles-content.json', 'utf-8'));
    const quizzes = JSON.parse(readFileSync('/home/ubuntu/tier2-quizzes.json', 'utf-8'));
    const assessment = JSON.parse(readFileSync('/home/ubuntu/tier2-mastery-assessment.json', 'utf-8'));

    // Insert articles
    console.log('Inserting 8 Tier 2 articles...');
    const { data: insertedArticles, error: articlesError } = await supabase
      .from('finance_articles')
      .insert(articles)
      .select();

    if (articlesError) {
      console.error('Error inserting articles:', articlesError);
      throw articlesError;
    }

    console.log(`✅ Inserted ${insertedArticles.length} articles`);

    // Create a map of slug to article_id
    const slugToId = {};
    insertedArticles.forEach(article => {
      slugToId[article.slug] = article.id;
    });

    // Insert quizzes
    console.log('Inserting 40 quiz questions (5 per article)...');
    let totalQuestions = 0;

    for (const quiz of quizzes) {
      const articleId = slugToId[quiz.article_slug];
      if (!articleId) {
        console.warn(`Warning: Article slug "${quiz.article_slug}" not found, skipping quiz`);
        continue;
      }

      // Prepare quiz questions with article_id
      const questionsToInsert = quiz.questions.map(q => ({
        article_id: articleId,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation_correct: q.explanation_correct,
        explanation_incorrect: q.explanation_incorrect
      }));

      const { data, error } = await supabase
        .from('article_quizzes')
        .insert(questionsToInsert);

      if (error) {
        console.error(`Error inserting quiz for ${quiz.article_slug}:`, error);
        throw error;
      }

      totalQuestions += questionsToInsert.length;
      console.log(`  ✅ Inserted ${questionsToInsert.length} questions for ${quiz.article_slug}`);
    }

    console.log(`✅ Inserted total of ${totalQuestions} quiz questions`);

    // Insert Tier 2 Mastery Assessment
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

    console.log('\n🎉 All Tier 2 content inserted successfully!');
    console.log('Summary:');
    console.log(`  - ${insertedArticles.length} articles`);
    console.log(`  - ${totalQuestions} quiz questions`);
    console.log(`  - ${assessmentQuestions.length} Tier 2 assessment questions`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

insertTier2Content();
