# Stripe Webhook Configuration Guide

This guide walks you through setting up the Stripe webhook endpoint to handle subscription events for SASS-E.

---

## Overview

The webhook endpoint receives events from Stripe when subscription-related actions occur (payment success, subscription created/updated/canceled, etc.). This is critical for:
- Creating Supabase accounts after successful payment
- Updating subscription status in the database
- Handling trial periods and renewals
- Processing payment failures

---

## Step 1: Access Stripe Webhook Settings

1. Go to your **Stripe Dashboard**: https://dashboard.stripe.com
2. Make sure you're in **Live mode** (toggle in top-right corner)
3. Navigate to **Developers** → **Webhooks**
4. Click **"Add endpoint"** button

---

## Step 2: Configure Webhook Endpoint

### Endpoint URL
```
https://sass-e.com/api/stripe/webhook
```

**Important:** Use your custom domain (`sass-e.com`), not the Manus preview URL.

### Events to Listen For

Select the following events (click "Select events" button):

**Checkout Events:**
- `checkout.session.completed` - When a customer completes checkout

**Subscription Events:**
- `customer.subscription.created` - When a subscription is created
- `customer.subscription.updated` - When a subscription is updated (trial ends, renewed, changed)
- `customer.subscription.deleted` - When a subscription is canceled or expires

**Invoice Events:**
- `invoice.payment_succeeded` - When a payment succeeds
- `invoice.payment_failed` - When a payment fails

### API Version
- Use the latest API version (should match your Stripe client version: `2026-01-28.clover`)

---

## Step 3: Save and Get Signing Secret

1. Click **"Add endpoint"** to save
2. You'll see your new webhook endpoint listed
3. Click on the endpoint to view details
4. Copy the **"Signing secret"** (starts with `whsec_...`)
5. This is your `CUSTOM_STRIPE_WEBHOOK_SECRET`

**Note:** You've already provided this secret, so it should be configured correctly.

---

## Step 4: Test Webhook

### Option A: Use Stripe Dashboard Test Events

1. In your webhook endpoint details, click **"Send test webhook"**
2. Select event type (e.g., `checkout.session.completed`)
3. Click **"Send test webhook"**
4. Check the **"Response"** tab to see if it returned `200 OK`

### Option B: Use Stripe CLI (Recommended for Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhook events to local server
stripe listen --forward-to https://sass-e.com/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

---

## Step 5: Verify Webhook is Working

### Check Webhook Logs in Stripe Dashboard

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **"Logs"** tab
4. You should see recent webhook attempts with status codes

### Expected Responses

- **200 OK** - Webhook processed successfully
- **400 Bad Request** - Invalid signature or malformed request
- **500 Internal Server Error** - Server error (check application logs)

### Check Application Logs

After a webhook event is received, check your application logs for:
```
[Webhook] Received event: checkout.session.completed
[Webhook] Creating Supabase account for new user...
[Webhook] Supabase account created successfully
```

---

## Step 6: Handle Webhook Failures

If webhooks are failing:

1. **Check Signing Secret** - Ensure `CUSTOM_STRIPE_WEBHOOK_SECRET` matches the secret in Stripe Dashboard
2. **Check Endpoint URL** - Must be publicly accessible (not localhost)
3. **Check SSL Certificate** - Stripe requires HTTPS with valid SSL
4. **Check Response Time** - Webhooks must respond within 30 seconds
5. **Check Logs** - Look for error messages in application logs

### Webhook Retry Logic

Stripe automatically retries failed webhooks:
- First retry: immediately
- Subsequent retries: exponential backoff (up to 3 days)

---

## Step 7: Monitor Webhook Health

### Stripe Dashboard Monitoring

- Go to **Developers** → **Webhooks**
- Check **"Success rate"** metric
- Review **"Recent attempts"** for failures

### Set Up Alerts

1. Go to **Developers** → **Webhooks** → your endpoint
2. Click **"Settings"**
3. Enable **"Email notifications"** for webhook failures

---

## Troubleshooting

### Issue: "No signatures found matching the expected signature"

**Cause:** Webhook signing secret mismatch

**Solution:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your endpoint
3. Copy the signing secret
4. Update `CUSTOM_STRIPE_WEBHOOK_SECRET` environment variable
5. Restart server

### Issue: "Webhook endpoint returned 500 error"

**Cause:** Server error processing webhook

**Solution:**
1. Check application logs for error details
2. Common causes:
   - Database connection failure
   - Supabase API error
   - Missing required metadata in checkout session
3. Fix the error and Stripe will automatically retry

### Issue: "Webhook not receiving events"

**Cause:** Endpoint URL incorrect or not publicly accessible

**Solution:**
1. Verify endpoint URL is correct: `https://sass-e.com/api/stripe/webhook`
2. Test endpoint manually:
   ```bash
   curl -X POST https://sass-e.com/api/stripe/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
3. Ensure domain is properly configured and SSL is valid

---

## Security Best Practices

1. **Always verify webhook signatures** - Already implemented in code
2. **Use HTTPS only** - Stripe requires SSL
3. **Keep signing secret secure** - Never commit to version control
4. **Implement idempotency** - Handle duplicate webhook events gracefully
5. **Log all webhook events** - For debugging and audit trail

---

## Next Steps

After webhook is configured:

1. **Test complete payment flow** - Use test card to verify end-to-end
2. **Monitor webhook logs** - Check for any failures
3. **Set up alerts** - Get notified of webhook issues
4. **Document webhook events** - Keep track of what each event does

---

## Summary

Your webhook endpoint is located at:
```
https://sass-e.com/api/stripe/webhook
```

It handles these critical events:
- ✅ Checkout completion → Creates Supabase account
- ✅ Subscription creation → Initializes subscription record
- ✅ Subscription updates → Updates trial status, renewal
- ✅ Subscription deletion → Marks subscription as canceled
- ✅ Payment success → Confirms payment received
- ✅ Payment failure → Handles failed payments

The webhook is secured with signature verification using your `CUSTOM_STRIPE_WEBHOOK_SECRET`.
