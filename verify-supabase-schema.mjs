import postgres from 'postgres';

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;

if (!SUPABASE_DB_URL) {
  console.error('❌ SUPABASE_DB_URL environment variable is not set');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase database...\n');

const sql = postgres(SUPABASE_DB_URL);

async function verifySchema() {
  try {
    // Check enums
    console.log('📋 Checking enums...');
    const enums = await sql`
      SELECT typname, enumlabel 
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE typname IN ('user_role', 'subscription_tier', 'billing_period', 'subscription_status')
      ORDER BY typname, enumlabel
    `;
    
    const enumsByType = {};
    enums.forEach(e => {
      if (!enumsByType[e.typname]) {
        enumsByType[e.typname] = [];
      }
      enumsByType[e.typname].push(e.enumlabel);
    });
    
    Object.keys(enumsByType).forEach(typname => {
      console.log(`✅ ${typname}: ${enumsByType[typname].join(', ')}`);
    });
    
    // Check tables
    console.log('\n📋 Checking tables...');
    const tables = await sql`
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    if (tables.length > 0) {
      console.log(`✅ Users table exists with ${tables.length} columns:`);
      tables.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default.substring(0, 30)}...` : '';
        console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    } else {
      console.log('⚠️  Users table not found');
    }
    
    // Check indexes
    console.log('\n📋 Checking indexes...');
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users' AND schemaname = 'public'
      ORDER BY indexname
    `;
    
    console.log(`✅ Found ${indexes.length} indexes:`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });
    
    // Test data insertion
    console.log('\n🧪 Testing data insertion...');
    const testUserId = crypto.randomUUID();
    
    await sql`
      INSERT INTO users (
        id, email, name, role, subscription_tier, subscription_status
      ) VALUES (
        ${testUserId}, 
        'test@example.com', 
        'Test User',
        'user',
        'starter',
        'trialing'
      )
    `;
    
    console.log('✅ Test user inserted successfully');
    
    // Query the test user
    const testUser = await sql`
      SELECT id, email, name, role, subscription_tier, subscription_status, created_at
      FROM users
      WHERE id = ${testUserId}
    `;
    
    if (testUser.length > 0) {
      console.log('✅ Test user retrieved successfully:');
      console.log(JSON.stringify(testUser[0], null, 2));
    }
    
    // Clean up test user
    await sql`DELETE FROM users WHERE id = ${testUserId}`;
    console.log('✅ Test user deleted successfully');
    
    // Count existing users
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`\n📊 Total users in database: ${userCount[0].count}`);
    
    console.log('\n✅ Schema verification complete!');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

verifySchema();
