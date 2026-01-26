import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;

if (!SUPABASE_DB_URL) {
  console.error("❌ SUPABASE_DB_URL environment variable is not set");
  process.exit(1);
}

console.log("🔄 Connecting to Supabase database...");

const client = postgres(SUPABASE_DB_URL);
const db = drizzle(client);

async function migrate() {
  try {
    console.log("🔄 Creating users table in Supabase...");
    
    // Create the users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(320),
        name TEXT,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
        selected_specialized_hubs TEXT[] DEFAULT '{}',
        hubs_selected_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_signed_in TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log("✅ Users table created successfully!");
    
    // Create indexes
    console.log("🔄 Creating indexes...");
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    
    console.log("✅ Indexes created successfully!");
    console.log("✅ Supabase database migration complete!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
