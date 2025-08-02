# GitHub Actions Secrets Configuration

This guide provides step-by-step instructions for configuring all GitHub Actions secrets required for automated deployment of FlexiBio Builder.

## Overview

The deployment workflow uses GitHub Actions secrets to securely store sensitive information like API keys, credentials, and configuration values. All environment variables are now stored as secrets for enhanced security.

## Required Secrets

### 🔐 Supabase Configuration (Required)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Settings → API |

### ☁️ AWS Configuration (Required)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key | AWS IAM → Users → Your deployment user |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key | AWS IAM → Users → Your deployment user |
| `S3_BUCKET_NAME` | S3 bucket name | AWS S3 → Your bucket name |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID | AWS CloudFront → Your distribution |

### 🌐 Application Configuration (Required)

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `VITE_APP_URL` | Your application URL | `https://linktree.alexkm.com` |

### 📊 Analytics Configuration (Optional)

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics Measurement ID | Google Analytics → Admin → Data Streams |
| `VITE_GOOGLE_TAG_MANAGER_ID` | Google Tag Manager Container ID | Google Tag Manager → Container Settings |
| `VITE_FACEBOOK_PIXEL_ID` | Facebook Pixel ID | Facebook Business → Events Manager |

### 🔧 Optional AWS Configuration

| Secret Name | Description | Default Value |
|-------------|-------------|---------------|
| `AWS_REGION` | AWS region for deployment | `us-east-1` |

## Step-by-Step Setup

### Step 1: Access GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. You'll see the "Repository secrets" section

### Step 2: Add Required Secrets

For each secret listed above:

1. Click **"New repository secret"**
2. Enter the **Name** (exactly as shown in the table)
3. Enter the **Secret** value
4. Click **"Add secret"**

### Step 3: Verify Supabase Secrets

#### Get Supabase URL and Key:

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy these values:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

**Example:**
```
VITE_SUPABASE_URL: https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-anon-key-here
```

### Step 4: Verify AWS Secrets

#### Get AWS Credentials:

From your IAM deployment user (created in [AWS Setup Guide](./AWS_SETUP.md)):

```
AWS_ACCESS_KEY_ID: AKIA1234567890EXAMPLE  (replace with your actual key)
AWS_SECRET_ACCESS_KEY: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY  (replace with your actual secret)
```

#### Get S3 Bucket Name:

Your S3 bucket name (should match your domain):
```
S3_BUCKET_NAME: linktree.alexkm.com
```

#### Get CloudFront Distribution ID:

1. Go to AWS CloudFront console
2. Find your distribution
3. Copy the **Distribution ID** (format: `E1234567890ABC`)

```
CLOUDFRONT_DISTRIBUTION_ID: E1234567890ABC
```

### Step 5: Configure Application URL

Set your application's production URL:
```
VITE_APP_URL: https://linktree.alexkm.com
```

### Step 6: Add Analytics (Optional)

#### Google Analytics:

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Go to **Admin** → **Data Streams**
4. Select your web stream
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

```
VITE_GOOGLE_ANALYTICS_ID: G-XXXXXXXXXX
```

#### Google Tag Manager:

1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Select your container
3. Copy the **Container ID** (format: `GTM-XXXXXXX`)

```
VITE_GOOGLE_TAG_MANAGER_ID: GTM-XXXXXXX
```

#### Facebook Pixel:

1. Go to [Facebook Business](https://business.facebook.com)
2. Navigate to **Events Manager**
3. Select your pixel
4. Copy the **Pixel ID** (numeric)

```
VITE_FACEBOOK_PIXEL_ID: 123456789012345
```

## Complete Secrets Checklist

### ✅ Required Secrets (Must have)

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `S3_BUCKET_NAME`
- [ ] `CLOUDFRONT_DISTRIBUTION_ID`
- [ ] `VITE_APP_URL`

### 📊 Optional Analytics Secrets

- [ ] `VITE_GOOGLE_ANALYTICS_ID`
- [ ] `VITE_GOOGLE_TAG_MANAGER_ID`
- [ ] `VITE_FACEBOOK_PIXEL_ID`

### ⚙️ Optional Configuration

- [ ] `AWS_REGION` (defaults to `us-east-1`)

## Testing Your Configuration

### Step 1: Verify Secrets Are Set

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Verify all required secrets are listed
3. Check that secret names match exactly (case-sensitive)

### Step 2: Test Deployment

1. Make a small change to your code
2. Commit and push to main branch:
   ```bash
   git add .
   git commit -m "test: verify GitHub secrets configuration"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub
4. Monitor the deployment workflow
5. Check for any environment variable related errors

### Step 3: Verify Build Environment

The GitHub Actions workflow will now use all secrets during the build process. Check the build logs to ensure:

- ✅ All environment variables are loaded
- ✅ Build completes successfully
- ✅ Deployment to S3 works
- ✅ CloudFront invalidation succeeds
- ✅ Health check passes

## Security Best Practices

### 🔒 Secret Management

- **Never commit secrets** to your repository
- **Use descriptive names** but don't include the actual values
- **Rotate secrets regularly** (quarterly recommended)
- **Monitor secret usage** through GitHub Actions logs

### 👀 Access Control

- **Limit repository access** to necessary team members
- **Use separate environments** (dev/staging/prod) with different secrets
- **Enable branch protection** to prevent unauthorized deployments

### 🚨 Incident Response

If a secret is compromised:

1. **Immediately revoke/rotate** the compromised credentials
2. **Update the GitHub secret** with new values
3. **Review access logs** for unauthorized usage
4. **Trigger new deployment** to ensure new secrets are used

## Troubleshooting

### Common Issues

#### 1. Build Fails with Environment Variable Errors

**Error**: `TypeError: Cannot read property of undefined`

**Solution**: 
- Verify all required secrets are set
- Check secret names match exactly (case-sensitive)
- Ensure values don't have extra spaces or newlines

#### 2. Supabase Connection Fails

**Error**: `supabase-js: Invalid URL or key`

**Solution**:
- Verify `VITE_SUPABASE_URL` format: `https://xxx.supabase.co`
- Check `VITE_SUPABASE_ANON_KEY` is the public anon key, not service role
- Ensure Supabase project is active and accessible

#### 3. AWS Deployment Fails

**Error**: `AccessDenied` or `InvalidAccessKeyId`

**Solution**:
- Verify AWS credentials are correct
- Check IAM user has necessary permissions
- Ensure S3 bucket name is correct
- Verify CloudFront distribution ID format

#### 4. Analytics Not Working

**Solution**:
- Analytics secrets are optional - missing ones won't break the build
- Verify the format of analytics IDs
- Check that analytics scripts are properly integrated

### Debug Commands

To troubleshoot locally:

```bash
# Check if environment variables are loaded
npm run build
# Look for any undefined variable errors

# Test with local environment file
cp .env.example .env
# Edit .env with your values
npm run dev
```

### GitHub Actions Debug

Enable debug logging in your workflow:

```yaml
# Add this to your workflow for debugging
- name: Debug Environment Variables
  run: |
    echo "VITE_SUPABASE_URL is set: ${{ secrets.VITE_SUPABASE_URL != '' }}"
    echo "AWS_ACCESS_KEY_ID is set: ${{ secrets.AWS_ACCESS_KEY_ID != '' }}"
    echo "S3_BUCKET_NAME: ${{ secrets.S3_BUCKET_NAME }}"
  # Don't echo actual secret values!
```

## Next Steps

After configuring all secrets:

1. **Test deployment** with a small change
2. **Monitor first few deployments** for any issues
3. **Set up monitoring** for failed deployments
4. **Document any project-specific** secret requirements
5. **Train team members** on secret management procedures

## Support

If you encounter issues:

1. Check the [Deployment Guide](./DEPLOYMENT.md) for troubleshooting
2. Review GitHub Actions logs for specific error messages
3. Verify all prerequisite services (Supabase, AWS) are properly configured
4. Ensure all secret values are correct and current

Remember: **Never share or commit actual secret values**. This documentation should only contain instructions and examples with placeholder values.