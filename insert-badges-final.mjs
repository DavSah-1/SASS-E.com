import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

async function insertBadges() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);
    
    const badges = JSON.parse(readFileSync('/home/ubuntu/learning-badges.json', 'utf8'));

    console.log('Inserting learning badges...');
    
    for (const badge of badges) {
      try {
        await connection.execute(
          'INSERT INTO learning_badges (name, description, icon, tier, criteria) VALUES (?, ?, ?, ?, ?)',
          [badge.name, badge.description, badge.icon, badge.tier, JSON.stringify(badge.criteria)]
        );
        console.log(`✓ Inserted badge: ${badge.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⊘ Badge already exists: ${badge.name}`);
        } else {
          console.error(`✗ Error inserting badge ${badge.name}:`, error.message);
        }
      }
    }

    await connection.end();
    console.log(`\n✅ Badge insertion complete! ${badges.length} badges processed.`);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

insertBadges();
