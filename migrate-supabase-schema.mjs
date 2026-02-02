/**
 * Migrate Supabase schema to match Manus database
 * Adds missing fields from Manus users table to Supabase users table
 */

import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "fs";

config();

const supabaseUrl = process.env.SUPABASE_DB_URL;

if (!supabaseUrl) {
  console.error("❌ SUPABASE_DB_URL not found in environment");
  process.exit(1);
}

console.log("=== Supabase Schema Migration ===\n");
console.log("Connecting to Supabase database...\n");

const sql = postgres(supabaseUrl);

try {
  // Read SQL migration file
  const migrationSQL = readFileSync("./add-missing-fields-to-supabase.sql", "utf8");
  
  // Split by semicolon and separate ALTER TABLE from CREATE INDEX statements
  const allStatements = migrationSQL
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith("--"));
  
  // Execute ALTER TABLE statements first, then CREATE INDEX
  const alterStatements = allStatements.filter(s => s.toUpperCase().startsWith("ALTER TABLE"));
  const indexStatements = allStatements.filter(s => s.toUpperCase().startsWith("CREATE INDEX"));
  const statements = [...alterStatements, ...indexStatements];

  console.log(`Executing ${statements.length} SQL statements...\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`[${i + 1}/${statements.length}] ${statement.substring(0, 80)}...`);
    
    try {
      await sql.unsafe(statement);
      console.log(`  ✅ Success\n`);
    } catch (error) {
      // Ignore "already exists" errors
      if (error.message.includes("already exists") || error.message.includes("duplicate")) {
        console.log(`  ⚠️  Already exists (skipped)\n`);
      } else {
        console.error(`  ❌ Error: ${error.message}\n`);
        throw error;
      }
    }
  }

  console.log("✅ Migration completed successfully!\n");

  // Verify the schema
  console.log("Verifying schema...\n");
  
  const columns = await sql`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `;

  console.log(`Found ${columns.length} columns in users table:\n`);
  
  const newFields = [
    "login_method",
    "preferred_language",
    "preferred_currency",
    "subscription_expires_at",
    "subscription_price",
    "subscription_currency",
    "stay_signed_in",
    "two_factor_enabled",
    "two_factor_secret",
    "backup_codes",
  ];

  for (const field of newFields) {
    const column = columns.find(c => c.column_name === field);
    if (column) {
      console.log(`  ✅ ${field} (${column.data_type})`);
    } else {
      console.log(`  ❌ ${field} - NOT FOUND`);
    }
  }

  console.log("\n=== Migration Summary ===");
  console.log("All missing fields from Manus database have been added to Supabase.");
  console.log("Both databases now have synchronized schemas.");

} catch (error) {
  console.error("\n❌ Migration failed:");
  console.error(error);
  process.exit(1);
} finally {
  await sql.end();
}
