# Troubleshooting Guide

This guide helps resolve common issues when running FlexiBio Builder.

## 🚨 Empty/Blank Page Issues

### Problem: Application shows blank page on localhost or production

This is usually caused by missing environment variables or JavaScript errors.

### Solution Steps:

#### 1. Check Browser Console (IMPORTANT)
1. **Open browser developer tools** (F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Look for error messages** (especially red errors)

**Common Error Messages:**
- `Missing VITE_SUPABASE_URL environment variable`
- `Missing VITE_SUPABASE_ANON_KEY environment variable`
- `TypeError: Cannot read properties of undefined`

#### 2. Fix Missing Environment Variables

**For Local Development:**

1. **Check if `.env` file exists** in project root
2. **If it doesn't exist**, copy from template:
   ```bash
   cp .env.example .env
   ```

3. **Get your Supabase credentials:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Settings** → **API**
   - Copy **Project URL** and **anon public key**

4. **Update `.env` file:**
   ```env
   # Supabase Configuration (REQUIRED)
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
   
   # Application Configuration (REQUIRED)  
   VITE_APP_URL=http://localhost:8080
   
   # Analytics (Optional)
   VITE_GOOGLE_ANALYTICS_ID=
   VITE_GOOGLE_TAG_MANAGER_ID=
   VITE_FACEBOOK_PIXEL_ID=
   ```

5. **Restart the development server:**
   ```bash
   npm run dev
   ```

**For Production Deployment:**

1. **Verify GitHub Actions secrets are set:**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Ensure these secrets exist and have values:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_APP_URL`

2. **Trigger new deployment:**
   ```bash
   git commit --allow-empty -m "trigger deployment"
   git push origin main
   ```

#### 3. Verify Supabase Setup

1. **Check Supabase project status:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Ensure your project is active (not paused)
   - Check database is accessible

2. **Test database connection:**
   - In your project, check if tables exist:
     - `links`
     - `profile_settings`
     - `link_analytics`

3. **Run database migrations if needed:**
   - Follow [Supabase Setup Guide](./SUPABASE_SETUP.md)
   - Execute the SQL schema in Supabase SQL Editor

#### 4. Check Network Issues

1. **Test Supabase connectivity:**
   ```bash
   # Test if Supabase URL is reachable
   curl https://your-project-ref.supabase.co/rest/v1/
   ```

2. **Check browser network tab:**
   - Open Developer Tools → Network tab
   - Refresh page
   - Look for failed requests (red entries)
   - Check if Supabase API calls are failing

## 🔧 Development Server Issues

### Problem: `npm run dev` fails to start

#### 1. Clear Cache and Reinstall
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start development server
npm run dev
```

#### 2. Check Port Conflicts
```bash
# Kill any process using port 8080
npx kill-port 8080

# Or use different port
npm run dev -- --port 3000
```

#### 3. Check Node.js Version
```bash
# Check Node.js version (should be 18+)
node --version

# If too old, update Node.js
# Visit https://nodejs.org
```

## 🌐 Production Deployment Issues

### Problem: Deployment succeeds but site doesn't work

#### 1. Check CloudFront Distribution
- Ensure CloudFront distribution is fully deployed (status: Deployed)
- Wait 10-15 minutes after deployment for global propagation
- Check if custom domain is properly configured

#### 2. Verify S3 Files
1. **Check S3 bucket contents:**
   - Files should include: `index.html`, `assets/` folder
   - `index.html` should not be empty

2. **Check file permissions:**
   - Ensure CloudFront can access files via OAC policy

#### 3. Test CloudFront URL Directly
- Access your CloudFront distribution URL directly
- Format: `https://d1234567890abc.cloudfront.net`
- If this works but custom domain doesn't, it's a DNS issue

### Problem: GitHub Actions deployment fails

#### 1. Check Secrets Configuration
- Verify all required GitHub Actions secrets are set
- Test AWS credentials work:
  ```bash
  aws sts get-caller-identity
  ```

#### 2. Check Build Logs
- Go to GitHub → Actions tab
- Click on failed deployment
- Check build step for environment variable errors
- Check deployment step for AWS permission errors

## 🗄️ Database Issues

### Problem: App loads but no content appears

#### 1. Check Database Connection
- Open browser console
- Look for Supabase-related errors
- Check if API calls to Supabase are succeeding

#### 2. Verify Database Schema
1. **Check if tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **Check if data exists:**
   ```sql
   SELECT * FROM profile_settings;
   SELECT * FROM links;
   ```

3. **Re-run migrations if needed:**
   - Go to Supabase SQL Editor
   - Execute schema from [Supabase Setup Guide](./SUPABASE_SETUP.md)

#### 3. Check Row Level Security (RLS)
1. **Verify RLS policies:**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies WHERE schemaname = 'public';
   ```

2. **Test data access:**
   - Try accessing data through Supabase dashboard
   - Check if policies allow public read access

## 📱 Browser-Specific Issues

### Problem: Works in one browser but not others

#### 1. Clear Browser Data
- Clear cache, cookies, and local storage
- Try incognito/private mode
- Disable browser extensions

#### 2. Check Browser Console
- Different browsers may show different errors
- Check for CORS issues
- Look for unsupported JavaScript features

#### 3. Test Multiple Browsers
- Chrome/Chromium
- Firefox
- Safari (if on Mac)
- Edge

## 🚀 Performance Issues

### Problem: App loads slowly or times out

#### 1. Check Bundle Size
```bash
npm run build
# Check dist/ folder size
```

#### 2. Optimize Images and Assets
- Compress images before upload
- Use appropriate image formats (WebP, AVIF)
- Enable CloudFront compression

#### 3. Check CDN Performance
- Test from different geographic locations
- Use tools like GTmetrix or PageSpeed Insights
- Consider enabling CloudFront compression

## 🔍 Debug Commands

### Quick Diagnostics
```bash
# Check environment variables
npm run security:check

# Test build locally
npm run build && npm run preview

# Check for TypeScript errors
npx tsc --noEmit

# Lint check
npm run lint
```

### Network Debugging
```bash
# Test Supabase connectivity
curl -H "apikey: YOUR_ANON_KEY" \
  "https://your-project.supabase.co/rest/v1/profile_settings"

# Test S3 access (should fail if properly secured)
curl https://linktree.alexkm.com.s3.amazonaws.com/index.html

# Test CloudFront access (should work)
curl https://linktree.alexkm.com/
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the browser console** for specific error messages
2. **Review the setup guides:**
   - [Supabase Setup](./SUPABASE_SETUP.md)
   - [AWS Setup](./AWS_SETUP.md)
   - [GitHub Secrets](./GITHUB_SECRETS.md)
3. **Search for similar issues** in the repository
4. **Provide detailed information** when reporting issues:
   - Browser console errors
   - Environment (local/production)
   - Steps to reproduce
   - Browser and OS versions

## 🛠️ Emergency Recovery

### Complete Reset (Last Resort)
```bash
# 1. Backup your configuration
cp .env .env.backup

# 2. Reset to clean state
git stash
git checkout main
git pull origin main

# 3. Clean install
rm -rf node_modules package-lock.json
npm install

# 4. Restore configuration
cp .env.backup .env

# 5. Restart
npm run dev
```

This should resolve most common issues. If problems persist, review the setup documentation or check for recent changes in the repository.