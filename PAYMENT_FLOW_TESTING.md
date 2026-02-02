# End-to-End Payment Flow Testing Guide

This guide walks you through testing the complete subscription payment flow for SASS-E, from plan selection to account creation.

---

## Prerequisites

Before testing, ensure:

1. ✅ **Custom domain configured**: `sass-e.com` is set up and accessible
2. ✅ **Stripe webhook configured**: Endpoint at `https://sass-e.com/api/stripe/webhook` with required events
3. ✅ **Custom Stripe keys set**: CUSTOM_STRIPE_SECRET_KEY, CUSTOM_STRIPE_PUBLISHABLE_KEY, CUSTOM_STRIPE_WEBHOOK_SECRET
4. ✅ **Supabase configured**: Site URL and redirect URLs include `https://sass-e.com`
5. ✅ **Site published**: Latest version deployed to production

---

## Test Flow Overview

```
1. User visits homepage
   ↓
2. User selects a plan (Starter/Pro/Ultimate)
   ↓
3. Hub selection modal opens (except Ultimate - all hubs included)
   ↓
4. User selects required hubs (1 for Starter, 2 for Pro)
   ↓
5. Redirects to /sign-up page
   ↓
6. User enters email and password
   ↓
7. Redirects to Stripe checkout
   ↓
8. User completes payment
   ↓
9. Stripe webhook fires → Creates Supabase account
   ↓
10. User redirected to success page
```

---

## Step-by-Step Testing

### Step 1: Access the Homepage

1. Open browser (incognito mode recommended)
2. Navigate to `https://sass-e.com`
3. Verify homepage loads correctly
4. Check that pricing cards are displayed

### Step 2: Select a Plan

**Test Starter Plan:**
1. Click "Choose Starter" button on homepage
2. Verify hub selection modal opens
3. Should show: "Select 1 Specialized Hub"
4. Available hubs: Language Learning, Math Tutor, Wellness Coach, Money Advisor, Career Mentor, Creative Writing, Coding Assistant, Study Companion

**Test Pro Plan:**
1. Click "Choose Pro" button
2. Verify hub selection modal opens
3. Should show: "Select 2 Specialized Hubs"
4. Same 8 hubs available

**Test Ultimate Plan:**
1. Click "Choose Ultimate" button
2. Verify hub selection modal opens
3. Should show: "All 8 Hubs Included"
4. All hubs pre-selected and disabled

### Step 3: Select Hubs

**For Starter:**
1. Click on 1 hub card
2. Verify selection indicator appears
3. Try selecting a 2nd hub - should be prevented
4. Verify "Continue to Checkout" button is enabled

**For Pro:**
1. Click on 2 hub cards
2. Verify both are selected
3. Try selecting a 3rd hub - should be prevented
4. Verify "Continue to Checkout" button is enabled

**For Ultimate:**
1. All hubs already selected
2. "Continue to Checkout" button immediately enabled

### Step 4: Proceed to Sign-Up

1. Click "Continue to Checkout" button
2. Verify redirect to `/sign-up` page
3. Check that selected plan and hubs are displayed:
   - "You're signing up for: [Tier] Plan"
   - "Selected hubs: [Hub names]"
   - Billing period displayed (Monthly/6-Month/Annual)

### Step 5: Complete Sign-Up Form

1. Enter email address (use a real email you can access)
2. Enter password (minimum 8 characters)
3. Click "Create Account & Continue to Payment"
4. Verify loading state appears
5. Should redirect to Stripe checkout page

### Step 6: Stripe Checkout

**Verify Checkout Session Details:**
- Product name: "SASS-E [Tier] - [Billing Period]"
- Price matches selected tier and billing period:
  - Starter: $9.99/mo, $49.99/6mo, $79.99/yr
  - Pro: $19.99/mo, $99.99/6mo, $159.99/yr
  - Ultimate: $39.99/mo, $199.99/6mo, $319.99/yr
- Trial period displayed (if applicable):
  - Monthly: 5 days free trial
  - 6-Month: 7 days free trial
  - Annual: 7 days free trial
  - Ultimate: No trial
- Currency selector available (USD/EUR/GBP)

**Complete Payment:**
1. Use Stripe test card: `4242 4242 4242 4242`
2. Expiry: Any future date (e.g., 12/34)
3. CVC: Any 3 digits (e.g., 123)
4. Postal code: Any 5 digits (e.g., 12345)
5. Click "Subscribe"
6. Wait for payment processing

### Step 7: Verify Webhook Processing

**Check Stripe Dashboard:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Check "Logs" tab
4. Look for recent `checkout.session.completed` event
5. Verify status: 200 OK

**Check Application Logs (if accessible):**
```
[Webhook] Received event: checkout.session.completed
[Webhook] Creating Supabase account for new user...
[Webhook] Email: user@example.com
[Webhook] Supabase account created successfully
[Webhook] User ID: abc123...
[Webhook] Subscription record created
```

### Step 8: Verify Account Creation

**Check Supabase Dashboard:**
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user by email
3. Verify user was created
4. Check user metadata includes:
   - subscription_tier
   - selected_hubs
   - stripe_customer_id
   - stripe_subscription_id

**Check Supabase Database:**
1. Go to Supabase Dashboard → Table Editor
2. Open `users` table
3. Find user by email
4. Verify fields:
   - `subscription_tier`: "starter", "pro", or "ultimate"
   - `subscription_status`: "trialing" or "active"
   - `selected_hubs`: JSON array of hub IDs
   - `stripe_customer_id`: starts with "cus_"
   - `stripe_subscription_id`: starts with "sub_"
   - `trial_end`: Date 5-7 days in future (if trial applies)

### Step 9: Verify Redirect to Success Page

1. After payment completes, should redirect to `/subscription/success`
2. Verify success page displays:
   - ✅ Success message
   - Subscription tier
   - Billing period
   - Selected hubs with icons
   - Trial days remaining (if applicable)
   - Next billing date
   - "Launch Assistant Bob" CTA button
   - "Return Home" button

### Step 10: Test Login

1. Click "Launch Assistant Bob" button
2. Should navigate to `/assistant` page
3. Verify user is automatically logged in
4. Check that user has access to selected hubs

---

## Test Scenarios

### Scenario 1: Starter Monthly with Language Hub

1. Select Starter plan
2. Choose Language Learning hub
3. Select Monthly billing
4. Complete sign-up and payment
5. Verify:
   - Trial: 5 days
   - Price: $9.99/month
   - Hub access: Language Learning only
   - Other hubs show "5-day trial" option

### Scenario 2: Pro Annual with 2 Hubs

1. Select Pro plan
2. Choose Money Advisor + Wellness Coach
3. Select Annual billing
4. Complete sign-up and payment
5. Verify:
   - Trial: 7 days
   - Price: $159.99/year (save 33%)
   - Hub access: Money Advisor + Wellness Coach
   - Other hubs show "5-day trial" option

### Scenario 3: Ultimate 6-Month (All Hubs)

1. Select Ultimate plan
2. All 8 hubs pre-selected
3. Select 6-Month billing
4. Complete sign-up and payment
5. Verify:
   - Trial: None (Ultimate has no trial)
   - Price: $199.99/6 months
   - Hub access: All 8 hubs included
   - No trial options shown

---

## Common Issues and Solutions

### Issue: Hub selection modal doesn't open

**Cause:** JavaScript error or modal component not loaded

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Refresh page and try again

### Issue: Redirect to /sign-up doesn't preserve plan selection

**Cause:** localStorage not working or plan data not saved

**Solution:**
1. Check browser console for localStorage errors
2. Verify plan selection is saved before redirect
3. Check `planSelection.ts` utility functions

### Issue: Stripe checkout shows wrong price

**Cause:** Price ID mismatch or incorrect billing period

**Solution:**
1. Verify Price IDs in environment variables match Stripe Dashboard
2. Check billing period selection (monthly/sixMonth/annual)
3. Ensure currency is correctly set

### Issue: Webhook returns 400 error

**Cause:** Invalid webhook signature

**Solution:**
1. Verify CUSTOM_STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
2. Check webhook endpoint URL is correct
3. Ensure request body is raw (not parsed)

### Issue: Supabase account not created

**Cause:** Webhook processing error or Supabase API failure

**Solution:**
1. Check application logs for errors
2. Verify Supabase credentials are correct
3. Check Supabase Dashboard for API errors
4. Ensure email/password meet Supabase requirements

### Issue: User not automatically logged in after payment

**Cause:** Auto-login not implemented (requires session token from webhook)

**Solution:**
- This is a known limitation
- User must manually log in after payment
- Future enhancement: Generate session token in webhook

---

## Testing Checklist

Before going live, complete this checklist:

- [ ] Test Starter plan with each hub option
- [ ] Test Pro plan with different hub combinations
- [ ] Test Ultimate plan (all hubs)
- [ ] Test Monthly billing period
- [ ] Test 6-Month billing period
- [ ] Test Annual billing period
- [ ] Test with USD currency
- [ ] Test with EUR currency
- [ ] Test with GBP currency
- [ ] Verify trial periods are correct
- [ ] Verify prices match Stripe Dashboard
- [ ] Verify webhook creates Supabase account
- [ ] Verify subscription data saves correctly
- [ ] Verify success page displays correctly
- [ ] Test payment failure scenario
- [ ] Test subscription cancellation
- [ ] Test subscription upgrade/downgrade

---

## Monitoring and Maintenance

### Daily Checks

1. **Stripe Dashboard → Webhooks**
   - Check webhook success rate (should be >95%)
   - Review failed webhook attempts
   - Monitor payment volume

2. **Supabase Dashboard → Authentication**
   - Check new user registrations
   - Verify subscription data is correct
   - Monitor authentication errors

3. **Application Logs**
   - Check for webhook processing errors
   - Monitor Stripe API errors
   - Review Supabase API errors

### Weekly Checks

1. **Test complete payment flow** - Use test card to verify end-to-end
2. **Review subscription metrics** - Active subscriptions, churn rate, MRR
3. **Check trial conversions** - How many trials convert to paid?

### Monthly Checks

1. **Review pricing strategy** - Are prices competitive?
2. **Analyze hub selection patterns** - Which hubs are most popular?
3. **Monitor payment failures** - Are there patterns?
4. **Review customer feedback** - Any issues with payment flow?

---

## Next Steps

After successful testing:

1. **Go live** - Switch from test mode to live mode in Stripe
2. **Update webhook** - Configure live mode webhook endpoint
3. **Monitor closely** - Watch for any issues in first 24 hours
4. **Collect feedback** - Ask early users about payment experience
5. **Iterate** - Improve based on real-world usage

---

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Webhook Testing**: Use Stripe CLI for local testing

---

## Summary

Your payment flow is ready for testing! Follow this guide to verify each step works correctly. Pay special attention to:

1. ✅ Hub selection preserves user choices
2. ✅ Sign-up page shows correct plan details
3. ✅ Stripe checkout displays correct prices
4. ✅ Webhook creates Supabase account successfully
5. ✅ Success page shows subscription details

Good luck with your launch! 🚀
