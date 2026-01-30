# Clerk Setup Guide

## Quick Setup Steps

### 1. Your Clerk Dashboard
Visit: https://dashboard.clerk.com

You already have your keys configured:
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`

### 2. Getting the Webhook Secret (Optional for Now)

**What is it?** 
The webhook secret is used to sync user data between Clerk and your MongoDB database.

**Do you need it immediately?** 
❌ **No** - You can use the app without it for now. Users can sign in, but won't be saved to your database.

**How to get it (when ready):**

1. Go to https://dashboard.clerk.com
2. Click on your application
3. Go to **Webhooks** in the left sidebar
4. Click **+ Add Endpoint**
5. Enter endpoint URL: `http://localhost:3000/api/auth/webhook`
   - For production: `https://yourdomain.com/api/auth/webhook`
6. Select these events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
7. Click **Create**
8. Copy the **Signing Secret** (starts with `whsec_...`)
9. Add to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### 3. Configure Sign-In/Sign-Up Pages

Clerk provides **two options**:

#### Option A: Hosted Pages (Easiest - RECOMMENDED)
Clerk hosts the pages for you. Just update your environment:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/student/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/student/dashboard
```

Then create these page files.

#### Option B: Custom Components
Build your own UI using Clerk components (more work, more control).

---

## Current Status

✅ **Authentication is working** - Clerk is connected
⚠️ **Webhook is optional** - Only needed if you want user data in MongoDB
🔧 **Sign-in pages** - Being created now

---

## Creating an Admin User

After you sign up:

1. Go to https://dashboard.clerk.com
2. Navigate to **Users**
3. Click on your user
4. Scroll to **Public metadata**
5. Click **Edit**
6. Add this JSON:
   ```json
   {
     "role": "ADMIN"
   }
   ```
7. Click **Save**
8. Refresh your app - you now have admin access!

---

## Testing

1. Visit: http://localhost:3000
2. Click "Sign In" or "Sign Up"
3. You'll be redirected to Clerk's authentication
4. After login, you'll return to the app
