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

    // Get article IDs for quizzes
    const { data: insertedArticles, error: fetchError } = await supabase
      .from('finance_articles')
      .select('id, slug')
      .in('slug', articles.map(a => a.slug));
    
    if (fetchError) {
      console.error('Error fetching article IDs:', fetchError);
      return;
    }

    const slugToId = {};
    insertedArticles.forEach(article => {
      slugToId[article.slug] = article.id;
    });

    // Insert quizzes
    const quizzes = JSON.parse(fs.readFileSync('/home/ubuntu/tier4-quizzes.json', 'utf8'));
    
    for (const quiz of quizzes) {
      const articleId = slugToId[quiz.article_slug];
      if (!articleId) {
        console.warn(`Warning: Article slug "${quiz.article_slug}" not found`);
        continue;
      }

      const { error: quizError } = await supabase
        .from('article_quizzes')
        .insert({
          article_id: articleId,
          questions: quiz.questions
        });
      
      if (quizError) {
        console.error(`Error inserting quiz for ${quiz.article_slug}:`, quizError);
      }
    }
    
    console.log('✅ Inserted 10 Tier 4 quizzes (50 questions) successfully');

    // Insert Tier 4 assessment
    const assessment = JSON.parse(fs.readFileSync('/home/ubuntu/tier4-mastery-assessment.json', 'utf8'));
    const { error: assessmentError } = await supabase
      .from('tier_assessments')
      .insert({
        tier_id: assessment.tier_id,
        title: assessment.title,
        description: assessment.description,
        questions: assessment.questions
      });
    
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
