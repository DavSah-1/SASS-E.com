import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.CUSTOM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });

const priceIds = [
  'price_1SvlJP1E9dwEBmgV0nZfZseo', // STARTER_MONTHLY
  'price_1SvlJP1E9dwEBmgVfGvSLYz0', // STARTER_SIX_MONTH
  'price_1SvlJP1E9dwEBmgV65GWmyxA', // STARTER_ANNUAL
  'price_1SvlSf1E9dwEBmgVH0xpJSae', // PRO_MONTHLY
  'price_1SvlSf1E9dwEBmgV7Ackd5iR', // PRO_SIX_MONTH
  'price_1SvlSf1E9dwEBmgVINoaub5i', // PRO_ANNUAL
  'price_1SwMYL1E9dwEBmgVkFdmJKhn', // ULTIMATE_MONTHLY
  'price_1SwMbL1E9dwEBmgVUaeTFTBh', // ULTIMATE_SIX_MONTH
  'price_1SwMbK1E9dwEBmgVA7000TYj', // ULTIMATE_ANNUAL
];

console.log('Checking if prices exist in your Stripe account...\n');

for (const priceId of priceIds) {
  try {
    const price = await stripe.prices.retrieve(priceId);
    console.log(`✓ ${priceId} - EXISTS (${price.currency} ${price.unit_amount / 100})`);
  } catch (error) {
    console.log(`✗ ${priceId} - NOT FOUND`);
  }
}

console.log('\nListing all products in your account:');
const products = await stripe.products.list({ limit: 10 });
console.log(`Found ${products.data.length} products:`);
products.data.forEach(p => {
  console.log(`  - ${p.name} (${p.id})`);
});

console.log('\nListing all prices in your account:');
const prices = await stripe.prices.list({ limit: 20 });
console.log(`Found ${prices.data.length} prices:`);
prices.data.forEach(p => {
  console.log(`  - ${p.id}: ${p.currency} ${p.unit_amount / 100} / ${p.recurring?.interval || 'one-time'}`);
});
