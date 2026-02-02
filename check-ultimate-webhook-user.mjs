import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
});

try {
  await client.connect();
  console.log('✅ Connected to Supabase');

  // Check if the webhook-ultimate-test user was created
  const result = await client.query(`
    SELECT 
      id,
      email,
      subscription_tier,
      billing_period,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id,
      selected_specialized_hubs,
      current_period_start,
      current_period_end,
      trial_days,
      created_at,
      updated_at
    FROM users 
    WHERE email = 'webhook-ultimate-test@example.com'
    ORDER BY created_at DESC
    LIMIT 1
  `);

  if (result.rows.length > 0) {
    console.log('\n🎉 SUCCESS! Webhook created the user in Supabase:');
    console.log(JSON.stringify(result.rows[0], null, 2));
  } else {
    console.log('\n❌ FAILED! User NOT found in Supabase database');
    console.log('Email searched: webhook-ultimate-test@example.com');
    
    // Check all users to see what exists
    const allUsers = await client.query('SELECT email, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('\nRecent users in database:');
    console.log(JSON.stringify(allUsers.rows, null, 2));
  }

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await client.end();
}
