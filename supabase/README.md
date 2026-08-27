# Supabase Setup

BudgetRick uses Supabase for auth and cloud sync. Without env vars, the app runs in **localStorage mode** (no login required).

## 1. Run the schema

Open your Supabase project SQL Editor and run the full contents of `supabase/schema.sql`.

Project ref: `ucuzptwfqvxpqnsdcbwh`

## 2. Configure env vars

Copy `.env.example` to `.env.local`:

```
VITE_SUPABASE_URL=https://ucuzptwfqvxpqnsdcbwh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Restart the dev server after changing env vars.

## 3. Auth

- Sign up at `/register` (email + password)
- Default categories are seeded on first signup
- Row Level Security scopes all data to `auth.uid()`

### Auth redirect URLs (Supabase Dashboard)

Under **Authentication → URL Configuration**, add:

- **Site URL:** your app origin (e.g. `http://localhost:5173` or your Cloudflare Pages URL)
- **Redirect URLs:**
  - `http://localhost:5173/**`
  - `https://your-domain.pages.dev/**`

Required for password reset, email change, and signup confirmation links.

### Account settings in the app

**Settings → Account** includes:

- Email verification status and resend
- Change email
- Change password
- Sign out

**Login → Forgot password** sends a reset link to `/reset-password`.

## 4. Cloudflare Pages

Set the same env vars in Pages project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Build command: `npm run build`

Output directory: `dist`

SPA routing uses `public/_redirects`.
