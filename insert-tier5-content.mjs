import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTier5Content() {
  try {
    // Read JSON files
    const articles = JSON.parse(readFileSync('/home/ubuntu/tier5-articles-content.json', 'utf8'));
    const quizzes = JSON.parse(readFileSync('/home/ubuntu/tier5-quizzes.json', 'utf8'));
    const assessment = JSON.parse(readFileSync('/home/ubuntu/tier5-mastery-assessment.json', 'utf8'));

    // Insert articles
    console.log('Inserting Tier 5 articles...');
    for (const article of articles) {
      const { data, error } = await supabase
        .from('finance_articles')
        .insert({
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content: article.content,
          readTime: article.readTime,
          difficulty: article.difficulty
        });
      
      if (error) {
        console.error(`Error inserting article ${article.slug}:`, error.message);
      } else {
        console.log(`✓ Inserted article: ${article.title}`);
      }
    }

    // Insert quizzes
    console.log('\nInserting Tier 5 quizzes...');
    for (const quiz of quizzes) {
      const { data, error } = await supabase
        .from('article_quizzes')
        .insert({
          article_slug: quiz.article_slug,
          questions: quiz.questions
        });
      
      if (error) {
        console.error(`Error inserting quiz for ${quiz.article_slug}:`, error.message);
      } else {
        console.log(`✓ Inserted quiz for: ${quiz.article_slug}`);
      }
    }

    // Insert assessment
    console.log('\nInserting Tier 5 Mastery Assessment...');
    const { data, error } = await supabase
      .from('tier_assessments')
      .insert({
        tier_id: assessment.tier_id,
        tier_name: assessment.tier_name,
        title: assessment.title,
        description: assessment.description,
        pass_rate: assessment.pass_rate,
        questions: assessment.questions
      });
    
    if (error) {
      console.error('Error inserting Tier 5 assessment:', error.message);
    } else {
      console.log('✓ Inserted Tier 5 Mastery Assessment');
    }

    console.log('\n✅ All Tier 5 content inserted successfully!');
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

insertTier5Content();
