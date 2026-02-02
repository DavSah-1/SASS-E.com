import postgres from 'postgres';
import fs from 'fs';

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;

if (!SUPABASE_DB_URL) {
  console.error('❌ SUPABASE_DB_URL environment variable is not set');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase database...');

const sql = postgres(SUPABASE_DB_URL);

// Read the SQL file
const sqlScript = fs.readFileSync('create-supabase-tables.sql', 'utf8');

// Split SQL script into statements, handling functions properly
const statements = [];
let currentStatement = '';
let inFunction = false;

for (const line of sqlScript.split('\n')) {
  const trimmedLine = line.trim();
  
  // Track if we're inside a function definition
  if (trimmedLine.includes('$func$') || trimmedLine.includes('$$')) {
    inFunction = !inFunction;
  }
  
  currentStatement += line + '\n';
  
  // Only split on semicolon if we're not inside a function
  if (trimmedLine.endsWith(';') && !inFunction) {
    const stmt = currentStatement.trim();
    if (stmt.length > 0 && !stmt.startsWith('--')) {
      statements.push(stmt);
    }
    currentStatement = '';
  }
}

// Add any remaining statement
if (currentStatement.trim().length > 0) {
  statements.push(currentStatement.trim());
}

console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

async function createSchema() {
  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--')) continue;
      
      console.log(`[${i + 1}/${statements.length}] Executing statement...`);
      
      try {
        await sql.unsafe(statement);
        console.log(`✅ Success\n`);
      } catch (error) {
        // Check if error is about already existing objects
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Already exists (skipping)\n`);
        } else {
          console.error(`❌ Error: ${error.message}\n`);
          throw error;
        }
      }
    }
    
    console.log('✅ All statements executed successfully!');
    console.log('\n📊 Verifying tables...');
    
    // Verify tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `;
    
    if (tables.length > 0) {
      console.log('✅ Users table created successfully');
    } else {
      console.log('⚠️  Users table not found');
    }
    
    // Verify enums were created
    const enums = await sql`
      SELECT typname 
      FROM pg_type 
      WHERE typname IN ('user_role', 'subscription_tier', 'billing_period', 'subscription_status')
    `;
    
    console.log(`✅ ${enums.length}/4 enums created successfully`);
    enums.forEach(e => console.log(`   - ${e.typname}`));
    
  } catch (error) {
    console.error('\n❌ Failed to create schema:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createSchema();
