# Stripe Setup Guide - Migrate to Your Own Stripe Account

This guide will help you migrate from Manus-provided Stripe to your own independent Stripe account for full portability and control.

---

## Why Migrate to Your Own Stripe Account?

**Benefits:**
- ✅ Full control over your payment processing
- ✅ Portable to any hosting platform (not tied to Manus)
- ✅ Direct access to Stripe Dashboard for analytics
- ✅ Aligns with your Supabase database architecture
- ✅ Easier to sell or transfer your application
- ✅ Custom branding in Stripe Checkout
- ✅ Access to all Stripe features and integrations

---

## Step 1: Create Your Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" or "Sign up"
3. Enter your email and create a password
4. Verify your email address
5. Complete your business profile (you can use test mode immediately)

---

## Step 2: Get Your API Keys

### Test Mode Keys (for development):

1. Log in to your Stripe Dashboard
2. Click "Developers" in the top right
3. Click "API keys" in the left sidebar
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

**Copy both keys** - you'll need them in Step 4.

---

## Step 3: Create Products and Prices

You need to create products in Stripe Dashboard that match your subscription tiers.

### Create Products:

1. In Stripe Dashboard, go to "Products" → "Add product"
2. Create these 4 products:

#### Product 1: SASS-E Free Tier
- **Name**: SASS-E Free Tier
- **Description**: Basic AI assistant with limited features
- **Pricing**: One-time $0.00 (or skip - free tier doesn't need Stripe)

#### Product 2: SASS-E Starter
- **Name**: SASS-E Starter
- **Description**: AI assistant with 1 specialized hub
- **Pricing Model**: Recurring
- Create 3 prices:
  - **Monthly**: $9.99/month (or your preferred price)
  - **6-Month**: $49.99 every 6 months (16% discount)
  - **Annual**: $79.99/year (33% discount)

#### Product 3: SASS-E Pro
- **Name**: SASS-E Pro
- **Description**: AI assistant with 2 specialized hubs
- **Pricing Model**: Recurring
- Create 3 prices:
  - **Monthly**: $19.99/month
  - **6-Month**: $99.99 every 6 months (16% discount)
  - **Annual**: $159.99/year (33% discount)

#### Product 4: SASS-E Ultimate
- **Name**: SASS-E Ultimate
- **Description**: AI assistant with all 8 specialized hubs
- **Pricing Model**: Recurring
- Create 3 prices:
  - **Monthly**: $39.99/month
  - **6-Month**: $199.99 every 6 months (16% discount)
  - **Annual**: $319.99/year (33% discount)

### Get Price IDs:

After creating each price, click on it and copy the **Price ID** (starts with `price_...`). You'll need these 9 price IDs.

---

## Step 4: Update Environment Variables

You need to replace the Manus-provided Stripe keys with your own.

### In Manus Management UI:

1. Go to Settings → Secrets
2. Update these variables:

```
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

3. Click "Save"

### Update Price IDs in Code:

You need to update the `server/stripe/products.ts` file with your new Price IDs.

**Current structure** (example):
```typescript
export const STRIPE_PRICES = {
  starter: {
    monthly: "price_1234567890abcdefg",
    sixMonth: "price_abcdefg1234567890",
    annual: "price_xyz1234567890abcd",
  },
  pro: {
    monthly: "price_...",
    sixMonth: "price_...",
    annual: "price_...",
  },
  ultimate: {
    monthly: "price_...",
    sixMonth: "price_...",
    annual: "price_...",
  },
};
```

Replace each price ID with the ones you copied from your Stripe Dashboard.

---

## Step 5: Configure Webhook Endpoint

Webhooks allow Stripe to notify your app when payments succeed, subscriptions renew, etc.

### In Stripe Dashboard:

1. Go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter your webhook URL:
   ```
   https://sass-e.manus.space/api/stripe/webhook
   ```
   (Replace with your actual domain)

4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Click "Add endpoint"

6. Click on your new webhook endpoint

7. Click "Reveal" next to "Signing secret"

8. Copy the signing secret (starts with `whsec_...`)

### Update Webhook Secret:

1. Go to Manus Management UI → Settings → Secrets
2. Update:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   ```
3. Click "Save"

---

## Step 6: Test Your Integration

### Test Checkout Flow:

1. Restart your dev server to pick up new environment variables
2. Go to your app and click "Choose Plan"
3. Select a tier and hubs
4. Enter test credentials on sign-up page
5. You'll be redirected to Stripe Checkout

### Use Stripe Test Cards:

- **Successful payment**: `4242 4242 4242 4242`
- **Payment requires authentication**: `4000 0025 0000 3155`
- **Payment declined**: `4000 0000 0000 9995`

Use any future expiration date, any 3-digit CVC, and any ZIP code.

### Verify Webhook Events:

1. Complete a test checkout
2. Go to Stripe Dashboard → Developers → Webhooks
3. Click on your webhook endpoint
4. Check "Events" tab to see if events were delivered successfully
5. Check your app's database to verify subscription was created

---

## Step 7: Go Live (After Testing)

### Complete Stripe KYC:

1. In Stripe Dashboard, click "Activate your account"
2. Provide business information
3. Add bank account details
4. Submit identity verification documents
5. Wait for approval (usually 1-3 business days)

### Get Live API Keys:

1. Toggle from "Test mode" to "Live mode" in Stripe Dashboard
2. Go to "Developers" → "API keys"
3. Copy your live keys:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

### Update to Live Keys:

1. In Manus Management UI → Settings → Secrets
2. Update:
   ```
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
   ```

### Create Live Webhook:

1. In Stripe Dashboard (Live mode), go to "Developers" → "Webhooks"
2. Add endpoint with same URL and events as test mode
3. Copy the new live webhook secret
4. Update `STRIPE_WEBHOOK_SECRET` with the live secret

### Update Price IDs:

Your live products will have different Price IDs than test mode. Update `server/stripe/products.ts` with live Price IDs.

---

## Step 8: Enable Promo Codes (Optional)

1. In Stripe Dashboard, go to "Products" → "Coupons"
2. Create a coupon (e.g., "LAUNCH99" for 99% off)
3. In checkout code, `allow_promotion_codes` is already enabled
4. Users can enter promo codes during checkout

---

## Troubleshooting

### Webhook not receiving events:

- Check webhook URL is correct and accessible
- Verify webhook secret matches in your environment variables
- Check Stripe Dashboard → Webhooks → Events for error messages
- Ensure your server is not blocking Stripe's IP addresses

### Checkout session not creating:

- Verify API keys are correct (test keys for test mode, live keys for live mode)
- Check Price IDs match your Stripe Dashboard products
- Look for errors in browser console and server logs

### Subscription not saving to database:

- Check webhook events are being received
- Verify Supabase credentials are correct
- Check server logs for database errors

---

## Migration Checklist

- [ ] Create Stripe account
- [ ] Get test API keys
- [ ] Create products and prices in Stripe Dashboard
- [ ] Copy all 9 Price IDs
- [ ] Update STRIPE_SECRET_KEY environment variable
- [ ] Update VITE_STRIPE_PUBLISHABLE_KEY environment variable
- [ ] Update Price IDs in server/stripe/products.ts
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Update STRIPE_WEBHOOK_SECRET environment variable
- [ ] Test checkout flow with test card 4242 4242 4242 4242
- [ ] Verify webhook events are received
- [ ] Verify subscription saves to Supabase database
- [ ] Complete Stripe KYC for live mode
- [ ] Get live API keys
- [ ] Update to live keys in production
- [ ] Create live webhook endpoint
- [ ] Update to live Price IDs

---

## Support

If you encounter issues:

1. Check Stripe Dashboard → Developers → Logs for API errors
2. Check Stripe Dashboard → Developers → Webhooks → Events for webhook delivery status
3. Check your server logs for errors
4. Visit [Stripe Documentation](https://stripe.com/docs) for detailed guides
5. Contact Stripe Support via Dashboard if needed

---

**Congratulations!** You now have full control over your payment processing with your own Stripe account. Your app is portable and can be moved to any hosting platform.
