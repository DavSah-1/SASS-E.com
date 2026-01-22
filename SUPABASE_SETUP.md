# Supabase Auth Integration Setup Guide

This guide will help you replace the Manus OAuth system with Supabase Auth to remove Meta branding from your login page.

## Why Supabase Auth?

- ✅ **No Meta branding** - Clean, customizable login UI
- ✅ **Generous free tier** - 50,000 monthly active users (vs Auth0's 7,000)
- ✅ **Includes PostgreSQL database** - Can replace MySQL if desired
- ✅ **Built-in storage** - S3-compatible file storage (1GB free)
- ✅ **Open-source** - Can self-host if needed
- ✅ **Real-time subscriptions** - WebSocket support included
- ✅ **Simpler integration** - Less configuration than Auth0

---

## Step 1: Create Supabase Account

1. Go to https://supabase.com and click "Start your project"
2. Sign up with GitHub, Google, or email
3. Verify your email address
4. You'll be taken to the dashboard

---

## Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in the details:
   - **Name**: `SASS-E` (or your app name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (50K MAU included)
3. Click **"Create new project"**
4. Wait 2-3 minutes for setup to complete

---

## Step 3: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API** in the left sidebar
2. Copy these values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (different long string)

⚠️ **Important**: Keep the `service_role` key secret! Never expose it in frontend code.

---

## Step 4: Configure Authentication Settings

### Enable Email/Password Auth

1. Go to **Authentication** → **Providers**
2. **Email** provider should be enabled by default
3. Configure settings:
   - **Enable email confirmations**: Toggle based on preference
   - **Enable email change confirmations**: Recommended (ON)
   - **Secure email change**: Recommended (ON)

### Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - For development: `http://localhost:3000`
   - For production: `https://your-manus-domain.manus.space`

### Add Redirect URLs

1. In **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/**
   https://your-manus-domain.manus.space/**
   ```

---

## Step 5: Enable Social Providers (Optional)

### Google OAuth

1. Go to **Authentication** → **Providers**
2. Click **Google**
3. Toggle **Enable Sign in with Google**
4. Follow instructions to get Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`
5. Paste **Client ID** and **Client Secret** in Supabase
6. Click **Save**

### GitHub OAuth

1. Click **GitHub** in providers list
2. Toggle **Enable Sign in with GitHub**
3. Follow instructions to create GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Authorization callback URL: `https://xxxxx.supabase.co/auth/v1/callback`
4. Paste **Client ID** and **Client Secret**
5. Click **Save**

---

## Step 6: Update Environment Variables

### For Manus Hosting

Use the Management UI → Settings → Secrets:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend (public keys only!)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Local Deployment

Update your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Frontend (exposed to browser - use anon key only!)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Step 7: Customize Login UI (Optional)

### Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password
3. Add your branding, logo, and colors

### Custom SMTP (Optional)

For production, use your own email service:

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP server (e.g., SendGrid, AWS SES)
3. This removes "via Supabase" from emails

---

## Step 8: Set Up Database (Optional)

If you want to use Supabase's PostgreSQL instead of MySQL:

### Create Users Table

```sql
-- Run in Supabase SQL Editor
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### Migrate Existing Data

If you have existing MySQL data:

1. Export from MySQL: `mysqldump -u root -p sass_e > backup.sql`
2. Convert MySQL syntax to PostgreSQL (tools: `pgloader`, manual editing)
3. Import to Supabase via SQL Editor

---

## Step 9: Test the Integration

### Test Locally

1. Start your development server:
   ```bash
   docker-compose up -d
   ```

2. Navigate to `http://localhost:3000`

3. Click "Sign In" - you should see Supabase's login UI

4. Create a test account with email/password

5. Check Supabase Dashboard → Authentication → Users to see the new user

### Test on Manus Hosting

1. Deploy your app with updated environment variables

2. Navigate to your Manus domain

3. Test the sign-in flow

4. Verify no Meta branding appears

---

## Step 10: Set Up User Roles

### Add Role Column to Auth Users

```sql
-- Add custom claims to auth.users
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS raw_app_meta_data JSONB DEFAULT '{}';

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (raw_app_meta_data->>'role')::TEXT = 'admin'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Assign Admin Role

```sql
-- Make a specific user an admin
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

---

## Integration Code Examples

### Frontend: Initialize Supabase Client

```typescript
// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Frontend: Auth Hook

```typescript
// client/src/hooks/useSupabaseAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

### Frontend: Sign In

```typescript
// Sign in with email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})

// Sign out
await supabase.auth.signOut()
```

### Backend: Verify User

```typescript
// server/middleware/auth.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key on backend
)

export async function verifyUser(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}
```

---

## Troubleshooting

### "Invalid API key" Error

**Problem**: Supabase rejects the API key

**Solution**:
- Check that you're using the correct project URL
- Verify the anon key is copied correctly (it's very long)
- Ensure no extra spaces or newlines

### Email Confirmations Not Sending

**Problem**: Users don't receive confirmation emails

**Solution**:
- Check **Authentication** → **Email Templates** are enabled
- Verify **Site URL** is set correctly
- Check spam folder
- For production, set up custom SMTP

### "User already registered" Error

**Problem**: Can't create account with existing email

**Solution**:
- Check **Authentication** → **Users** to see if user exists
- Delete test users from dashboard
- Or use password reset to access existing account

### CORS Errors

**Problem**: Browser blocks requests to Supabase

**Solution**:
- Add your domain to **Redirect URLs** in Supabase
- Ensure you're using `VITE_SUPABASE_URL` (not `SUPABASE_URL`) in frontend

### Row Level Security Blocks Queries

**Problem**: Can't read/write data even when authenticated

**Solution**:
- Check RLS policies in Supabase SQL Editor
- Ensure policies use `auth.uid()` correctly
- Temporarily disable RLS for testing (not recommended for production)

---

## Migration from Manus OAuth

### Existing Users

Existing users with Manus OAuth accounts will need to:
1. Create new Supabase accounts
2. Use the same email address
3. Their data will be preserved (linked by email)

### Data Migration

If you need to migrate user data:

```sql
-- Export users from MySQL
SELECT id, email, name, role, created_at
FROM users
INTO OUTFILE '/tmp/users.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Import to Supabase (via SQL Editor or CSV import)
COPY users(id, email, name, role, created_at)
FROM '/path/to/users.csv'
DELIMITER ','
CSV HEADER;
```

---

## Security Best Practices

1. **Never expose service_role key** - Only use in backend code
2. **Enable RLS** - Protect all tables with Row Level Security
3. **Use MFA** - Enable in **Authentication** → **Auth Providers** → **Phone**
4. **Set password policy** - **Authentication** → **Auth Providers** → **Email** → Password requirements
5. **Monitor logs** - **Logs** → **Auth Logs** to detect suspicious activity
6. **Rotate keys** - Periodically regenerate API keys in **Settings** → **API**

---

## Cost Considerations

### Free Tier Limits
- 50,000 monthly active users
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests

### Paid Plans (if needed)
- **Pro**: $25/month
  - 100,000 MAU
  - 8 GB database
  - 100 GB storage
  - 250 GB bandwidth
  - Daily backups

- **Team**: $599/month
  - Unlimited MAU
  - Dedicated resources
  - Point-in-time recovery

For most projects, the free tier is more than sufficient.

---

## Advantages Over MySQL + Manus OAuth

| Feature | Supabase | MySQL + Manus OAuth |
|---------|----------|---------------------|
| Authentication | ✅ Built-in | ❌ External service |
| Database | ✅ PostgreSQL | ✅ MySQL |
| Storage | ✅ Included | ❌ Need MinIO/S3 |
| Real-time | ✅ Built-in | ❌ Need custom WebSocket |
| Free Tier Users | 50,000 | Depends on Manus |
| Self-Hosting | ✅ Possible | ✅ Possible |
| Meta Branding | ❌ None | ⚠️ In OAuth flow |

---

## Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Community Discord**: https://discord.supabase.com
- **GitHub Discussions**: https://github.com/supabase/supabase/discussions
- **Status Page**: https://status.supabase.com
- **Support**: Email support for Pro+ plans

---

## Next Steps

After Supabase is configured:

1. ✅ Test authentication flow thoroughly
2. ✅ Customize email templates with your branding
3. ✅ Set up social login providers (optional)
4. ✅ Configure Row Level Security policies
5. ✅ Set up custom SMTP for production emails
6. ✅ Monitor usage in Supabase Dashboard

---

## Rollback Plan

If you need to revert to Manus OAuth:

1. Remove Supabase environment variables
2. Restore original Manus OAuth variables
3. Restart the application
4. Users can log in with Manus accounts again

Keep a backup of your original `.env` file before making changes.

---

## Self-Hosting Supabase (Advanced)

If you want to self-host Supabase:

```bash
# Clone Supabase
git clone https://github.com/supabase/supabase
cd supabase/docker

# Configure
cp .env.example .env
# Edit .env with your settings

# Start services
docker-compose up -d

# Access at http://localhost:3000
```

Self-hosting gives you complete control but requires more maintenance.
