import { drizzle } from 'drizzle-orm/mysql2';
import { learningBadges } from './drizzle/schema.ts';
import { readFileSync } from 'fs';

const db = drizzle(process.env.DATABASE_URL);

async function insertBadges() {
  try {
    const badges = JSON.parse(readFileSync('/home/ubuntu/learning-badges.json', 'utf8'));

    console.log('Inserting learning badges...');
    
    for (const badge of badges) {
      try {
        await db.insert(learningBadges).values({
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          tier: badge.tier,
          criteria: JSON.stringify(badge.criteria)
        });
        console.log(`✓ Inserted badge: ${badge.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⊘ Badge already exists: ${badge.name}`);
        } else {
          console.error(`✗ Error inserting badge ${badge.name}:`, error.message);
        }
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
