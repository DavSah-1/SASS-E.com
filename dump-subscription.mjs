import Stripe from 'stripe';

const stripe = new Stripe(process.env.CUSTOM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

const sessions = await stripe.checkout.sessions.list({ limit: 1 });
const session = sessions.data[0];
const subscriptionId = session.subscription;

console.log('Fetching subscription:', subscriptionId);

const subscription = await stripe.subscriptions.retrieve(subscriptionId);

console.log('\n📋 Full Subscription Object:');
console.log(JSON.stringify(subscription, null, 2));
