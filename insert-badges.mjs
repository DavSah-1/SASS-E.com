import { drizzle } from 'drizzle-orm/mysql2';
import { readFileSync } from 'fs';

const db = drizzle(process.env.DATABASE_URL);

async function insertBadges() {
  try {
    const badges = JSON.parse(readFileSync('/home/ubuntu/learning-badges.json', 'utf8'));

    console.log('Inserting learning badges...');
    
    for (const badge of badges) {
      try {
        await db.execute(`
          INSERT INTO learning_badges (name, description, icon, tier, criteria)
          VALUES (?, ?, ?, ?, ?)
        `, [
          badge.name,
          badge.description,
          badge.icon,
          badge.tier,
          JSON.stringify(badge.criteria)
        ]);
        console.log(`✓ Inserted badge: ${badge.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⊘ Badge already exists: ${badge.name}`);
        } else {
          console.error(`✗ Error inserting badge ${badge.name}:`, error.message);
        }
      }
    }

    console.log('\n✅ Badge insertion complete!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

insertBadges();
