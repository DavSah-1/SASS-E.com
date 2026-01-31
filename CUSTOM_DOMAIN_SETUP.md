# Custom Domain Setup Guide: sass-e.com

This guide walks you through configuring your custom domain `sass-e.com` for your SASS-E application.

---

## Overview

Your application needs to be accessible at `https://sass-e.com` instead of the default Manus subdomain. This requires:

1. **Domain configuration in Manus** - Point sass-e.com to your Manus app
2. **Update Supabase redirect URLs** - Allow authentication from sass-e.com
3. **Update Stripe webhook URL** - Receive payment events at sass-e.com
4. **DNS configuration** - Point your domain to Manus servers

---

## Step 1: Configure Domain in Manus

### Option A: Purchase Domain Through Manus (Recommended)

1. Go to Manus Management UI → Settings → Domains
2. Click "Purchase New Domain"
3. Search for `sass-e.com`
4. Complete purchase and registration
5. Domain will be automatically configured

### Option B: Bind Existing Domain

If you already own `sass-e.com`:

1. Go to Manus Management UI → Settings → Domains
2. Click "Add Custom Domain"
3. Enter `sass-e.com`
4. Follow the DNS configuration instructions provided
5. Add the required DNS records to your domain registrar:
   - **Type:** CNAME
   - **Name:** @ (or leave blank for root domain)
   - **Value:** (provided by Manus, typically something like `cname.manus.space`)
   - **TTL:** 3600 (or automatic)

6. Wait for DNS propagation (5 minutes to 48 hours, usually ~1 hour)
7. Click "Verify" in Manus dashboard

---

## Step 2: Update Supabase Redirect URLs

Your authentication flow needs to redirect to `sass-e.com` after sign-in.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update **Site URL** to: `https://sass-e.com`
5. In **Redirect URLs**, add:
   - `https://sass-e.com`
   - `https://sass-e.com/sign-in`
   - `https://sass-e.com/sign-up`
   - `https://sass-e.com/*` (wildcard for all pages)

6. Remove old URLs (optional):
   - `https://sass-e.manus.space`
   - Any localhost URLs

7. Click **Save**

---

## Step 3: Update Stripe Webhook URL

Stripe needs to send payment events to your new domain.

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **Webhooks**
3. Find your existing webhook endpoint
4. Click **...** (three dots) → **Update details**
5. Change **Endpoint URL** to: `https://sass-e.com/api/stripe/webhook`
6. Ensure these events are selected:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

7. Click **Update endpoint**

**Important:** If you're using both test and live modes in Stripe, update webhooks in BOTH modes!

---

## Step 4: Update Environment Variables (Already Done)

✅ **VITE_SITE_URL** has been updated to `https://sass-e.com`

This variable is used throughout the application for:
- Authentication redirects
- Magic link emails
- Stripe checkout success/cancel URLs
- OAuth callbacks

---

## Step 5: Test Your Custom Domain

After DNS propagation and all configurations are complete:

### 1. Test Domain Access
- Visit `https://sass-e.com`
- Verify the site loads correctly
- Check for SSL certificate (padlock icon in browser)

### 2. Test Authentication Flow
- Click "Get Started" or "Choose Plan"
- Enter email and password on sign-up page
- Verify redirect works correctly
- Check magic link email (if using magic link auth)
- Confirm email link redirects to `https://sass-e.com`

### 3. Test Stripe Checkout
- Select a plan and hubs
- Enter test credentials
- Verify Stripe checkout opens
- Use test card: `4242 4242 4242 4242`
- Complete checkout
- Verify redirect back to `https://sass-e.com/subscription/success`

### 4. Verify Webhook Delivery
- Go to Stripe Dashboard → Developers → Webhooks
- Click on your webhook endpoint
- Check "Events" tab for recent deliveries
- Verify all events show "Success" status

### 5. Check Supabase Data
- Go to Supabase Dashboard → Table Editor
- Check `users` table for new user account
- Verify subscription data is saved correctly

---

## Troubleshooting

### Domain Not Loading

**Issue:** `sass-e.com` doesn't load or shows error

**Solutions:**
- Check DNS propagation: Use [whatsmydns.net](https://www.whatsmydns.net) to verify DNS records
- Wait longer (DNS can take up to 48 hours)
- Verify CNAME record is correct in your domain registrar
- Check Manus dashboard for domain verification status

### Authentication Redirects to Old Domain

**Issue:** After sign-in, redirected to `sass-e.manus.space` instead of `sass-e.com`

**Solutions:**
- Verify VITE_SITE_URL is set to `https://sass-e.com`
- Restart the server (or publish a new version)
- Clear browser cache and cookies
- Check Supabase redirect URLs include `sass-e.com`

### Stripe Webhook Not Receiving Events

**Issue:** Payments complete but subscription not created in database

**Solutions:**
- Verify webhook URL is `https://sass-e.com/api/stripe/webhook`
- Check Stripe Dashboard → Webhooks → Events for delivery errors
- Ensure webhook signing secret (STRIPE_WEBHOOK_SECRET) is correct
- Test webhook delivery using Stripe CLI: `stripe trigger checkout.session.completed`

### SSL Certificate Error

**Issue:** Browser shows "Not Secure" or SSL error

**Solutions:**
- Wait for Manus to provision SSL certificate (automatic, takes 5-15 minutes)
- Verify domain is properly verified in Manus dashboard
- Try accessing with `https://` explicitly
- Contact Manus support if issue persists

---

## DNS Configuration Reference

If binding an existing domain, you'll need to configure these DNS records at your domain registrar:

### For Root Domain (sass-e.com)

```
Type: CNAME
Name: @ (or blank)
Value: [provided by Manus]
TTL: 3600
```

### For WWW Subdomain (www.sass-e.com)

```
Type: CNAME
Name: www
Value: [provided by Manus]
TTL: 3600
```

**Note:** Some registrars don't allow CNAME records on root domains. In that case, use:

```
Type: A
Name: @ (or blank)
Value: [IP address provided by Manus]
TTL: 3600
```

---

## Checklist

Use this checklist to track your progress:

- [ ] Domain configured in Manus (purchased or bound)
- [ ] DNS records added to domain registrar
- [ ] DNS propagation verified
- [ ] SSL certificate active
- [ ] Supabase Site URL updated to https://sass-e.com
- [ ] Supabase redirect URLs include sass-e.com
- [ ] Stripe webhook URL updated to https://sass-e.com/api/stripe/webhook
- [ ] VITE_SITE_URL environment variable set to https://sass-e.com
- [ ] Server restarted (or new version published)
- [ ] Domain loads correctly in browser
- [ ] Authentication flow tested
- [ ] Stripe checkout tested
- [ ] Webhook delivery verified
- [ ] Subscription data saving correctly

---

## Next Steps After Domain Setup

Once your custom domain is fully configured:

1. **Update marketing materials** - Use sass-e.com in all communications
2. **Set up email forwarding** - Configure email@sass-e.com if desired
3. **Configure analytics** - Update Google Analytics or other tracking tools
4. **Test on mobile devices** - Verify responsive design works on phones/tablets
5. **Monitor performance** - Check page load times and user experience

---

## Support

If you encounter issues:

- **Manus Support:** Use Management UI → Help or visit https://help.manus.im
- **Supabase Support:** https://supabase.com/support
- **Stripe Support:** https://support.stripe.com
- **DNS Issues:** Contact your domain registrar's support

---

**Domain Status:** ☐ Not Configured | ☐ In Progress | ☐ Fully Configured
