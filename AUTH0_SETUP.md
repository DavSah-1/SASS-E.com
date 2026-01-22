# Auth0 Integration Setup Guide

This guide will help you replace the Manus OAuth system with Auth0 to remove Meta branding from your login page.

## Why Auth0?

- ✅ **No Meta branding** - Professional, clean login UI
- ✅ **Free tier** - Up to 7,000 monthly active users
- ✅ **Fully customizable** - Add your own logo, colors, and branding
- ✅ **Enterprise security** - MFA, social logins, passwordless options
- ✅ **Easy integration** - Works with existing Manus hosting

---

## Step 1: Create Auth0 Account

1. Go to https://auth0.com and click "Sign Up"
2. Choose "Personal" account type (free tier)
3. Select your region (choose closest to your users)
4. Complete email verification

---

## Step 2: Create Auth0 Application

1. In Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **Create Application**
3. Name it "SASS-E" (or your app name)
4. Choose **Single Page Web Applications**
5. Click **Create**

---

## Step 3: Configure Application Settings

In your Auth0 application settings:

### Allowed Callback URLs
Add both development and production URLs:
```
http://localhost:3000/api/oauth/callback,
https://your-manus-domain.manus.space/api/oauth/callback
```

### Allowed Logout URLs
```
http://localhost:3000,
https://your-manus-domain.manus.space
```

### Allowed Web Origins
```
http://localhost:3000,
https://your-manus-domain.manus.space
```

### Allowed Origins (CORS)
```
http://localhost:3000,
https://your-manus-domain.manus.space
```

Click **Save Changes**

---

## Step 4: Get Your Auth0 Credentials

From your Auth0 application settings, copy these values:

- **Domain**: `your-tenant.us.auth0.com` (or your region)
- **Client ID**: `abc123...` (long alphanumeric string)
- **Client Secret**: `xyz789...` (from "Settings" tab, click "Show")

---

## Step 5: Update Environment Variables

### For Manus Hosting

Use the Management UI → Settings → Secrets to update:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_AUDIENCE=https://your-tenant.us.auth0.com/api/v2/

# Update these to use Auth0
OAUTH_SERVER_URL=https://your-tenant.us.auth0.com
VITE_OAUTH_PORTAL_URL=https://your-tenant.us.auth0.com/authorize
```

### For Local Deployment

Update your `.env` file:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_AUDIENCE=https://your-tenant.us.auth0.com/api/v2/

# Update OAuth URLs
OAUTH_SERVER_URL=https://your-tenant.us.auth0.com
VITE_OAUTH_PORTAL_URL=https://your-tenant.us.auth0.com/authorize
```

---

## Step 6: Customize Login Page (Optional but Recommended)

### Add Your Branding

1. In Auth0 Dashboard, go to **Branding** → **Universal Login**
2. Click **Customize**
3. Upload your logo
4. Choose your brand colors
5. Preview the login page
6. Click **Save**

### Custom Login Page HTML (Advanced)

For complete control, enable "Custom Login Page":

1. Go to **Branding** → **Universal Login** → **Advanced Options**
2. Toggle **Customize Login Page**
3. Use the provided HTML template
4. Customize colors, fonts, and layout
5. Click **Save**

---

## Step 7: Configure Social Connections (Optional)

Allow users to sign in with Google, GitHub, etc.:

1. Go to **Authentication** → **Social**
2. Click on a provider (e.g., **Google**)
3. Follow the setup instructions
4. Enable the connection for your application
5. Click **Save**

---

## Step 8: Test the Integration

### Test Locally

1. Start your development server:
   ```bash
   docker-compose up -d
   ```

2. Navigate to `http://localhost:3000`

3. Click "Sign In" - you should be redirected to Auth0's login page

4. Create a test account or sign in

5. You should be redirected back to your app

### Test on Manus Hosting

1. Deploy your app with updated environment variables

2. Navigate to your Manus domain

3. Test the sign-in flow

4. Verify no Meta branding appears

---

## Step 9: Set Up User Roles (Optional)

To maintain admin functionality:

1. In Auth0 Dashboard, go to **User Management** → **Roles**
2. Click **Create Role**
3. Name it "admin"
4. Add permissions as needed
5. Assign the role to your user account

---

## Troubleshooting

### "Callback URL mismatch" Error

**Problem**: Auth0 rejects the callback URL

**Solution**: 
- Check that your callback URL exactly matches what's in Auth0 settings
- Include the protocol (`http://` or `https://`)
- No trailing slashes

### "Invalid state" Error

**Problem**: State parameter doesn't match

**Solution**:
- Clear browser cookies
- Ensure `JWT_SECRET` is set in environment variables
- Check that session cookies are working

### Login Page Shows Auth0 Branding

**Problem**: Default Auth0 branding visible

**Solution**:
- Go to **Branding** → **Universal Login**
- Upload your logo
- Customize colors
- Save changes

### Users Can't Access Admin Features

**Problem**: Role-based access not working

**Solution**:
- Update `server/db.ts` to check Auth0 roles
- Map Auth0 user metadata to your `users.role` field
- Update the `upsertUser` function

---

## Migration from Manus OAuth

### Existing Users

Existing users with Manus OAuth accounts will need to:
1. Create new Auth0 accounts
2. Use the same email address
3. Their data will be preserved (linked by email)

### Data Migration Script

If you need to migrate user data:

```bash
# Export users from current database
docker-compose exec db mysqldump -u root -p sass_e users > users_backup.sql

# Update openId fields to match Auth0 user IDs
# (Manual process or custom script needed)
```

---

## Security Best Practices

1. **Enable MFA**: Go to **Security** → **Multi-factor Auth** → Enable
2. **Set password policy**: **Security** → **Password Policy** → Set requirements
3. **Enable bot detection**: **Security** → **Attack Protection** → Enable
4. **Monitor logs**: **Monitoring** → **Logs** → Review regularly
5. **Rotate secrets**: Periodically regenerate Client Secret

---

## Cost Considerations

### Free Tier Limits
- 7,000 active users/month
- Unlimited logins
- 2 social connections
- Email/password authentication
- Basic MFA

### Paid Plans (if needed)
- **Essentials**: $35/month - 500 active users, then $0.07/user
- **Professional**: $240/month - 1,000 active users, then $0.24/user
- **Enterprise**: Custom pricing

For most small to medium projects, the free tier is sufficient.

---

## Support Resources

- **Auth0 Documentation**: https://auth0.com/docs
- **Community Forum**: https://community.auth0.com
- **Status Page**: https://status.auth0.com
- **Support**: Available in dashboard (paid plans)

---

## Next Steps

After Auth0 is configured:

1. ✅ Test login flow thoroughly
2. ✅ Customize branding to match SASS-E
3. ✅ Set up social connections (optional)
4. ✅ Configure MFA for security
5. ✅ Update documentation for users
6. ✅ Monitor Auth0 logs for issues

---

## Rollback Plan

If you need to revert to Manus OAuth:

1. Restore original environment variables
2. Restart the application
3. Users can log in with Manus accounts again

Keep a backup of your original `.env` file before making changes.
