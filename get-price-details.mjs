import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.CUSTOM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });

console.log('Fetching all prices with details...\n');

const prices = await stripe.prices.list({ limit: 20, expand: ['data.product'] });

const pricesByProduct = {};

for (const price of prices.data) {
  const productName = price.product.name;
  const amount = price.unit_amount / 100;
  const currency = price.currency.toUpperCase();
  const interval = price.recurring?.interval;
  const intervalCount = price.recurring?.interval_count || 1;
  
  let billingPeriod = '';
  if (interval === 'month' && intervalCount === 1) {
    billingPeriod = 'monthly';
  } else if (interval === 'month' && intervalCount === 6) {
    billingPeriod = 'six_month';
  } else if (interval === 'year') {
    billingPeriod = 'annual';
  }
  
  if (!pricesByProduct[productName]) {
    pricesByProduct[productName] = {};
  }
  
  pricesByProduct[productName][billingPeriod] = {
    priceId: price.id,
    amount,
    currency,
    interval,
    intervalCount
  };
}

console.log('Organized prices by product:\n');
console.log(JSON.stringify(pricesByProduct, null, 2));

console.log('\n\nEnvironment variable mapping:\n');

const tierMap = {
  'SASS-E Sarter': 'STARTER', // Note: typo in product name
  'SASS-E Pro': 'PRO',
  'SASS-E Ultimate': 'ULTIMATE'
};

for (const [productName, prices] of Object.entries(pricesByProduct)) {
  const tier = tierMap[productName];
  if (!tier) continue;
  
  console.log(`# ${productName}`);
  if (prices.monthly) {
    console.log(`STRIPE_PRICE_${tier}_MONTHLY=${prices.monthly.priceId}`);
  }
  if (prices.six_month) {
    console.log(`STRIPE_PRICE_${tier}_SIX_MONTH=${prices.six_month.priceId}`);
  }
  if (prices.annual) {
    console.log(`STRIPE_PRICE_${tier}_ANNUAL=${prices.annual.priceId}`);
  }
  console.log('');
}
