import postgres from 'postgres';

const sql = postgres(process.env.SUPABASE_DB_URL);

try {
  console.log('Checking Supabase users table columns...\n');
  
  const columns = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position
  `;
  
  console.log('Available columns:');
  columns.forEach(col => {
    console.log(`- ${col.column_name} (${col.data_type})`);
  });
  
  console.log('\nNow checking for the test user...\n');
  
  const users = await sql`
    SELECT * 
    FROM users
    WHERE email = 'devserver-webhook-test@example.com'
    LIMIT 1
  `;
  
  if (users.length === 0) {
    console.log('❌ User NOT found in database');
  } else {
    console.log('✅ User FOUND!\n');
    console.log(JSON.stringify(users[0], null, 2));
  }
  
  await sql.end();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
