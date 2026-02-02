import Stripe from 'stripe';

// Initialize Stripe with custom test key
const stripe = new Stripe(process.env.CUSTOM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

console.log('🔍 Fetching the latest checkout session...\n');

// Get the latest checkout session (the one we just completed)
const sessions = await stripe.checkout.sessions.list({
  limit: 5,
});

if (sessions.data.length === 0) {
  console.log('❌ No checkout sessions found');
  process.exit(1);
}

// Find the Ultimate plan session
const session = sessions.data.find(s => 
  s.customer_details?.email === 'webhook-ultimate-test@example.com'
) || sessions.data[0];

console.log('✅ Found checkout session:');
console.log(`   ID: ${session.id}`);
console.log(`   Customer Email: ${session.customer_details?.email}`);
console.log(`   Amount: $${(session.amount_total / 100).toFixed(2)}`);
console.log(`   Status: ${session.payment_status}`);
console.log(`   Subscription ID: ${session.subscription}`);
console.log(`   Metadata:`, JSON.stringify(session.metadata, null, 2));

// Now import and call the webhook handler directly
console.log('\n📤 Calling webhook handler directly...\n');

try {
  // Dynamically import the webhook handler
  const { handleWebhookEvent } = await import('./server/stripe/webhook.ts');
  
  // Create a mock event
  const event = {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: session,
    },
  };
  
  // Call the handler
  await handleWebhookEvent(event);
  
  console.log('\n✅ Webhook handler executed successfully!');
  console.log('\nNow checking if user was created in Supabase...\n');
  
  // Check if user was created
  const { default: pg } = await import('pg');
  const { Client } = pg;
  
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
  });
  
  await client.connect();
  
  const result = await client.query(`
    SELECT 
      id,
      email,
      subscription_tier,
      billing_period,
      subscription_status,
      stripe_customer_id,
      stripe_subscription_id
    FROM users 
    WHERE email = '${session.customer_details?.email}'
    ORDER BY created_at DESC
    LIMIT 1
  `);
  
  if (result.rows.length > 0) {
    console.log('🎉 SUCCESS! User found in Supabase:');
    console.log(JSON.stringify(result.rows[0], null, 2));
  } else {
    console.log('❌ User NOT found in Supabase');
  }
  
  await client.end();
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
}
