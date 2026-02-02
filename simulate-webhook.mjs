import Stripe from 'stripe';

// Initialize Stripe with custom test key
const stripe = new Stripe(process.env.CUSTOM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

console.log('🔍 Fetching the latest checkout session...\n');

// Get the latest checkout session (the one we just completed)
const sessions = await stripe.checkout.sessions.list({
  limit: 1,
});

if (sessions.data.length === 0) {
  console.log('❌ No checkout sessions found');
  process.exit(1);
}

const session = sessions.data[0];

console.log('✅ Found checkout session:');
console.log(`   ID: ${session.id}`);
console.log(`   Customer Email: ${session.customer_details?.email}`);
console.log(`   Amount: $${(session.amount_total / 100).toFixed(2)}`);
console.log(`   Status: ${session.payment_status}`);
console.log(`   Subscription ID: ${session.subscription}`);

// Simulate the webhook event by calling our webhook handler directly
console.log('\n📤 Simulating webhook event...\n');

const webhookUrl = 'http://localhost:3000/api/stripe/webhook';

// Create a test event
const event = {
  id: `evt_test_${Date.now()}`,
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: session,
  },
};

// Send POST request to webhook endpoint
try {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'test_signature', // This will fail signature verification
    },
    body: JSON.stringify(event),
  });

  const responseText = await response.text();
  
  console.log(`Response Status: ${response.status}`);
  console.log(`Response Body: ${responseText}`);
  
  if (response.ok) {
    console.log('\n✅ Webhook processed successfully!');
  } else {
    console.log('\n❌ Webhook processing failed');
  }
} catch (error) {
  console.error('\n❌ Error calling webhook:', error.message);
}
