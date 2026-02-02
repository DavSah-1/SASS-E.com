import Stripe from 'stripe';

// Initialize Stripe with custom test key
const stripe = new Stripe(process.env.CUSTOM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

console.log('🔍 Fetching the latest checkout session...\n');

// Get the latest checkout session
const sessions = await stripe.checkout.sessions.list({
  limit: 1,
});

const session = sessions.data[0];
const subscriptionId = session.subscription;

console.log('Session metadata:', session.metadata);
console.log('\n🔍 Fetching subscription details...\n');

// Get subscription details
const subscription = await stripe.subscriptions.retrieve(subscriptionId);

console.log('Subscription details:');
console.log(`  ID: ${subscription.id}`);
console.log(`  Status: ${subscription.status}`);
console.log(`  Current period start: ${subscription.current_period_start}`);
console.log(`  Current period end: ${subscription.current_period_end}`);
console.log(`  Current period start (Date): ${new Date(subscription.current_period_start * 1000)}`);
console.log(`  Current period end (Date): ${new Date(subscription.current_period_end * 1000)}`);

// Parse metadata
const tier = session.metadata?.tier;
const billingPeriod = session.metadata?.billingPeriod;
const selectedHubs = session.metadata?.selectedHubs 
  ? JSON.parse(session.metadata.selectedHubs) 
  : [];

const trialDays = billingPeriod === "monthly" ? 5 : 7;
const effectiveTrialDays = tier === "ultimate" ? 0 : trialDays;

console.log('\n📊 Update data that would be sent:');
const updateData = {
  id: session.metadata?.userId,
  stripeCustomerId: session.customer,
  stripeSubscriptionId: subscriptionId,
  subscriptionTier: tier,
  subscriptionStatus: subscription.status,
  billingPeriod: billingPeriod,
  trialDays: effectiveTrialDays,
  currentPeriodStart: new Date(subscription.current_period_start * 1000),
  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  selectedSpecializedHubs: selectedHubs,
  isNewUser: "yes",
  updatedAt: new Date(),
};

if (selectedHubs.length > 0) {
  updateData.hubsSelectedAt = new Date();
}

console.log(JSON.stringify(updateData, null, 2));

// Check if dates are valid
console.log('\n✅ Date validation:');
console.log(`  currentPeriodStart: ${updateData.currentPeriodStart.toISOString()}`);
console.log(`  currentPeriodEnd: ${updateData.currentPeriodEnd.toISOString()}`);
console.log(`  updatedAt: ${updateData.updatedAt.toISOString()}`);
if (updateData.hubsSelectedAt) {
  console.log(`  hubsSelectedAt: ${updateData.hubsSelectedAt.toISOString()}`);
}
