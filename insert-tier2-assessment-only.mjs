import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertAssessment() {
  try {
    const assessment = JSON.parse(readFileSync('/home/ubuntu/tier2-mastery-assessment.json', 'utf-8'));
    
    console.log('Inserting Tier 2 Mastery Assessment...');
    
    const { data, error } = await supabase
      .from('tier_assessments')
      .insert({
        tier_id: assessment.tier_id,
        title: assessment.title,
        description: assessment.description,
        questions: assessment.questions,
        pass_rate: (assessment.passing_score / 100).toString()
      });

    if (error) {
      console.error('Error inserting Tier 2 assessment:', error);
      throw error;
    }

    console.log(`✅ Inserted Tier 2 Mastery Assessment with ${assessment.questions.length} questions`);
    console.log(`   Pass rate: ${assessment.passing_score}% (${assessment.passing_score / 10}/10 correct)`);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

insertAssessment();
