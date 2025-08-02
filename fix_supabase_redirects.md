# Fix Supabase Password Reset Redirects

## Problem
Password reset links redirect to `http://localhost:3000` instead of production domain `https://linktree.alexkm.com`

## Fix in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update these settings:

### Site URL
```
https://linktree.alexkm.com
```

### Redirect URLs (add these)
```
https://linktree.alexkm.com
https://linktree.alexkm.com/admin
https://linktree.alexkm.com/auth/callback
https://linktree.alexkm.com/**
```

### Remove localhost URLs
Remove any entries like:
- `http://localhost:3000`
- `http://localhost:8080`
- Any other localhost URLs

## Fix in Code (if needed)

Check if your code is explicitly setting localhost redirects in password reset calls.

## Test the Fix

1. Request a new password reset
2. Check that the email link contains `redirect_to=https://linktree.alexkm.com`
3. Verify the redirect works properly after clicking the link

## Important Notes

- Changes in Supabase Dashboard take effect immediately
- You may need to request a new password reset email after making changes
- The old localhost link you received won't work - you'll need a new one