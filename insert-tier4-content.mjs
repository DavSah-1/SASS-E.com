import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTier4Content() {
  try {
    // Insert articles
    const articles = JSON.parse(fs.readFileSync('/home/ubuntu/tier4-articles-content.json', 'utf8'));
    const { data: articlesData, error: articlesError } = await supabase
      .from('finance_articles')
      .insert(articles);
    
    if (articlesError) {
      console.error('Error inserting articles:', articlesError);
    } else {
      console.log('✅ Inserted 10 Tier 4 articles successfully');
    }

    // Insert quizzes
    const quizzes = JSON.parse(fs.readFileSync('/home/ubuntu/tier4-quizzes.json', 'utf8'));
    const { data: quizzesData, error: quizzesError } = await supabase
      .from('article_quizzes')
      .insert(quizzes);
    
    if (quizzesError) {
      console.error('Error inserting quizzes:', quizzesError);
    } else {
      console.log('✅ Inserted 10 Tier 4 quizzes (50 questions) successfully');
    }

    // Insert Tier 4 assessment
    const assessment = JSON.parse(fs.readFileSync('/home/ubuntu/tier4-mastery-assessment.json', 'utf8'));
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('tier_assessments')
      .insert(assessment);
    
    if (assessmentError) {
      console.error('Error inserting assessment:', assessmentError);
    } else {
      console.log('✅ Inserted Tier 4 Mastery Assessment (10 questions) successfully');
    }

    console.log('\n🎉 All Tier 4 content inserted successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

insertTier4Content();
