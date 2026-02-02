import postgres from 'postgres';

const sql = postgres(process.env.SUPABASE_DB_URL);

try {
  console.log('Checking for webhook test user...\n');
  
  // Query for the user we just created
  const users = await sql`
    SELECT 
      id,
      email,
      stripe_customer_id,
      stripe_subscription_id,
      subscription_tier,
      billing_period,
      subscription_status,
      subscription_hubs,
      created_at
    FROM users
    WHERE email = 'devserver-webhook-test@example.com'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  if (users.length === 0) {
    console.log('❌ User NOT found in database');
    console.log('This means the webhook was not processed or failed');
  } else {
    const user = users[0];
    console.log('✅ User FOUND in database!\n');
    console.log('User Details:');
    console.log('-------------');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Stripe Customer ID: ${user.stripe_customer_id || 'Not set'}`);
    console.log(`Stripe Subscription ID: ${user.stripe_subscription_id || 'Not set'}`);
    console.log(`Subscription Tier: ${user.subscription_tier || 'Not set'}`);
    console.log(`Billing Period: ${user.billing_period || 'Not set'}`);
    console.log(`Subscription Status: ${user.subscription_status || 'Not set'}`);
    console.log(`Selected Hubs: ${user.subscription_hubs || 'Not set'}`);
    console.log(`Created At: ${user.created_at}`);
  }
  
  await sql.end();
} catch (error) {
  console.error('Error querying database:', error);
  process.exit(1);
}
