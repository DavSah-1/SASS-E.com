# Stripe Migration Quick Checklist

Use this checklist to track your progress migrating from Manus-provided Stripe to your own Stripe account.

---

## Pre-Migration (Test Mode)

### 1. Create Stripe Account
- [ ] Sign up at [stripe.com](https://stripe.com)
- [ ] Verify email address
- [ ] Complete business profile (optional for test mode)

### 2. Get Test API Keys
- [ ] Go to Stripe Dashboard → Developers → API keys
- [ ] Copy Publishable key (pk_test_...)
- [ ] Copy Secret key (sk_test_...)

### 3. Create Products in Stripe Dashboard
- [ ] Create "SASS-E Starter" product
  - [ ] Monthly price: £7.99/month
  - [ ] 6-Month price: £40.31 every 6 months
  - [ ] Annual price: £64.31/year
- [ ] Create "SASS-E Pro" product
  - [ ] Monthly price: £14.99/month
  - [ ] 6-Month price: £75.55 every 6 months
  - [ ] Annual price: £120.71/year
- [ ] Create "SASS-E Ultimate" product
  - [ ] Monthly price: £24.99/month
  - [ ] 6-Month price: £125.95 every 6 months
  - [ ] Annual price: £201.11/year

### 4. Copy Price IDs
- [ ] Copy Starter Monthly Price ID
- [ ] Copy Starter 6-Month Price ID
- [ ] Copy Starter Annual Price ID
- [ ] Copy Pro Monthly Price ID
- [ ] Copy Pro 6-Month Price ID
- [ ] Copy Pro Annual Price ID
- [ ] Copy Ultimate Monthly Price ID
- [ ] Copy Ultimate 6-Month Price ID
- [ ] Copy Ultimate Annual Price ID

### 5. Update Environment Variables
Go to Manus Management UI → Settings → Secrets and update:

- [ ] STRIPE_SECRET_KEY = `sk_test_YOUR_KEY`
- [ ] VITE_STRIPE_PUBLISHABLE_KEY = `pk_test_YOUR_KEY`
- [ ] STRIPE_PRICE_STARTER_MONTHLY = `price_...`
- [ ] STRIPE_PRICE_STARTER_SIX_MONTH = `price_...`
- [ ] STRIPE_PRICE_STARTER_ANNUAL = `price_...`
- [ ] STRIPE_PRICE_PRO_MONTHLY = `price_...`
- [ ] STRIPE_PRICE_PRO_SIX_MONTH = `price_...`
- [ ] STRIPE_PRICE_PRO_ANNUAL = `price_...`
- [ ] STRIPE_PRICE_ULTIMATE_MONTHLY = `price_...`
- [ ] STRIPE_PRICE_ULTIMATE_SIX_MONTH = `price_...`
- [ ] STRIPE_PRICE_ULTIMATE_ANNUAL = `price_...`

### 6. Configure Webhook
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Enter webhook URL: `https://sass-e.manus.space/api/stripe/webhook`
- [ ] Select events:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
- [ ] Click "Add endpoint"
- [ ] Copy webhook signing secret (whsec_...)
- [ ] Update STRIPE_WEBHOOK_SECRET in Manus Settings → Secrets

### 7. Test Integration
- [ ] Restart dev server (or publish site)
- [ ] Go to your app
- [ ] Click "Choose Plan" → Select Starter
- [ ] Enter test email and password
- [ ] Verify redirected to Stripe Checkout
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete checkout
- [ ] Verify webhook received in Stripe Dashboard → Webhooks → Events
- [ ] Verify subscription created in Supabase database
- [ ] Verify user account created in Supabase Auth

---

## Go Live (Production Mode)

### 8. Complete Stripe KYC
- [ ] In Stripe Dashboard, click "Activate your account"
- [ ] Provide business information
- [ ] Add bank account details
- [ ] Submit identity verification documents
- [ ] Wait for approval (1-3 business days)

### 9. Get Live API Keys
- [ ] Toggle Stripe Dashboard to "Live mode"
- [ ] Go to Developers → API keys
- [ ] Copy Live Publishable key (pk_live_...)
- [ ] Copy Live Secret key (sk_live_...)

### 10. Create Live Products
- [ ] Create same products as test mode (Starter, Pro, Ultimate)
- [ ] Create same prices (monthly, 6-month, annual)
- [ ] Copy all 9 live Price IDs

### 11. Update to Live Keys
In Manus Management UI → Settings → Secrets:

- [ ] STRIPE_SECRET_KEY = `sk_live_YOUR_KEY`
- [ ] VITE_STRIPE_PUBLISHABLE_KEY = `pk_live_YOUR_KEY`
- [ ] Update all 9 STRIPE_PRICE_* variables with live Price IDs

### 12. Configure Live Webhook
- [ ] In Stripe Dashboard (Live mode) → Developers → Webhooks
- [ ] Add endpoint: `https://sass-e.manus.space/api/stripe/webhook`
- [ ] Select same 6 events as test mode
- [ ] Copy live webhook signing secret
- [ ] Update STRIPE_WEBHOOK_SECRET with live secret

### 13. Final Testing
- [ ] Complete a real test purchase (use 99% off promo code if available)
- [ ] Verify webhook events delivered
- [ ] Verify subscription created correctly
- [ ] Verify billing in Stripe Dashboard
- [ ] Test subscription renewal (or wait for actual renewal)

---

## Post-Migration

### 14. Monitor & Maintain
- [ ] Set up Stripe email notifications for failed payments
- [ ] Monitor Stripe Dashboard → Payments for issues
- [ ] Check webhook delivery regularly
- [ ] Review subscription analytics monthly

---

## Troubleshooting

If something doesn't work:

1. **Checkout not opening?**
   - Check STRIPE_SECRET_KEY is correct
   - Verify Price IDs match your Stripe Dashboard
   - Check browser console for errors

2. **Webhook not receiving events?**
   - Verify webhook URL is correct and accessible
   - Check STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
   - Look at Stripe Dashboard → Webhooks → Events for delivery errors

3. **Subscription not saving to database?**
   - Check webhook events are being received
   - Verify Supabase credentials are correct
   - Check server logs for database errors

---

**Need Help?**
- See detailed instructions in `STRIPE_SETUP_GUIDE.md`
- Check Stripe Dashboard → Developers → Logs for API errors
- Visit [Stripe Documentation](https://stripe.com/docs)
- Contact Stripe Support via Dashboard

---

**Migration Status:** ☐ Not Started | ☐ In Progress | ☐ Completed
