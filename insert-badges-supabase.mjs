import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertBadges() {
  try {
    const badges = JSON.parse(readFileSync('/home/ubuntu/learning-badges.json', 'utf8'));

    console.log('Inserting learning badges into Supabase...');
    
    for (const badge of badges) {
      const { error } = await supabase
        .from('learning_badges')
        .insert({
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          tier: badge.tier,
          criteria: JSON.stringify(badge.criteria)
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          console.log(`⊘ Badge already exists: ${badge.name}`);
        } else {
          console.error(`✗ Error inserting badge ${badge.name}:`, error.message);
        }
      } else {
        console.log(`✓ Inserted badge: ${badge.name}`);
      }
    }

    console.log(`\n✅ Badge insertion complete! ${badges.length} badges processed.`);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

insertBadges();
