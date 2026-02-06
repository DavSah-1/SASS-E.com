import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTier6Content() {
  try {
    const articles = JSON.parse(readFileSync('/home/ubuntu/tier6-articles-content.json', 'utf8'));
    const quizzes = JSON.parse(readFileSync('/home/ubuntu/tier6-quizzes.json', 'utf8'));
    const assessment = JSON.parse(readFileSync('/home/ubuntu/tier6-mastery-assessment.json', 'utf8'));

    // Insert articles
    console.log('Inserting Tier 6 articles...');
    for (const article of articles) {
      const { error } = await supabase
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

    // Get article IDs for quiz insertion
    console.log('\nFetching article IDs...');
    const { data: articleData, error: fetchError } = await supabase
      .from('finance_articles')
      .select('id, slug')
      .in('slug', articles.map(a => a.slug));
    
    if (fetchError) {
      throw new Error(`Failed to fetch articles: ${fetchError.message}`);
    }

    const slugToId = {};
    articleData.forEach(article => {
      slugToId[article.slug] = article.id;
    });

    // Insert quizzes
    console.log('\nInserting Tier 6 quizzes...');
    for (const quiz of quizzes) {
      const articleId = slugToId[quiz.article_slug];
      if (!articleId) {
        console.warn(`Warning: Article slug "${quiz.article_slug}" not found`);
        continue;
      }

      const { error } = await supabase
        .from('article_quizzes')
        .insert({
          article_id: articleId,
          questions: quiz.questions
        });
      
      if (error) {
        console.error(`Error inserting quiz for ${quiz.article_slug}:`, error.message);
      } else {
        console.log(`✓ Inserted quiz for: ${quiz.article_slug}`);
      }
    }

    // Insert assessment
    console.log('\nInserting Tier 6 Mastery Assessment...');
    const { error: assessmentError } = await supabase
      .from('tier_assessments')
      .insert({
        tier_id: assessment.tier_id,
        title: assessment.title,
        description: assessment.description,
        pass_rate: assessment.pass_rate,
        questions: assessment.questions
      });
    
    if (assessmentError) {
      console.error('Error inserting Tier 6 assessment:', assessmentError.message);
    } else {
      console.log('✓ Inserted Tier 6 Mastery Assessment');
    }

    console.log('\n✅ All Tier 6 content inserted successfully!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

insertTier6Content();
