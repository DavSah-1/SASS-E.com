#!/usr/bin/env node
/**
 * Run Supabase database migration
 * Usage: pnpm tsx server/run-supabase-migration.mjs
 */

import postgres from "postgres";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  
  if (!dbUrl) {
    console.error("❌ SUPABASE_DB_URL environment variable is not set");
    process.exit(1);
  }

  console.log("🔄 Connecting to Supabase database...");
  const sql = postgres(dbUrl);

  try {
    // Read migration file
    const migrationPath = join(__dirname, "migrations", "001_add_subscription_fields.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📝 Running migration: 001_add_subscription_fields.sql");
    
    // Execute migration
    await sql.unsafe(migrationSQL);

    console.log("✅ Migration completed successfully!");
    
    // Verify new columns exist
    console.log("\n🔍 Verifying new columns...");
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN (
        'stripe_customer_id',
        'stripe_subscription_id',
        'subscription_status',
        'billing_period',
        'trial_days',
        'hub_trial_start_dates',
        'current_period_start',
        'current_period_end',
        'cancel_at_period_end',
        'is_new_user'
      )
      ORDER BY column_name;
    `;

    console.log("\n📊 New columns added:");
    result.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type})`);
    });

    console.log("\n🎉 Database migration successful!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
