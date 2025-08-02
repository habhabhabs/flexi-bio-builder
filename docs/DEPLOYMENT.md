# Deployment Guide

This comprehensive guide covers the complete deployment process for FlexiBio Builder, from local development to production.

## Quick Start Checklist

- [ ] Supabase project created and configured
- [ ] AWS S3 bucket and CloudFront distribution set up
- [ ] Domain DNS configured
- [ ] GitHub repository secrets configured
- [ ] Environment variables set
- [ ] Initial deployment tested

## Prerequisites

Before starting deployment, ensure you have completed:

1. **Supabase Setup** - Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. **AWS Setup** - Follow [AWS_SETUP.md](./AWS_SETUP.md)
3. **Domain Registration** - Have your domain ready (e.g., `alexkm.com`)

## Environment Configuration

### 1. Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

# Application Configuration (Required)
VITE_APP_URL=https://linktree.alexkm.com

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
VITE_FACEBOOK_PIXEL_ID=123456789012345
```

### 2. GitHub Repository Secrets

For complete setup of all GitHub Actions secrets, see the detailed guide:

**📚 [GitHub Secrets Configuration Guide](./GITHUB_SECRETS.md)**

**Quick Reference - Required Secrets:**

| Secret Name | Source | Required |
|-------------|--------|----------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | ✅ |
| `VITE_APP_URL` | Your application URL | ✅ |
| `AWS_ACCESS_KEY_ID` | IAM User credentials | ✅ |
| `AWS_SECRET_ACCESS_KEY` | IAM User credentials | ✅ |
| `S3_BUCKET_NAME` | Your S3 bucket name | ✅ |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront console | ✅ |

**Optional Analytics Secrets:**
- `VITE_GOOGLE_ANALYTICS_ID`
- `VITE_GOOGLE_TAG_MANAGER_ID`
- `VITE_FACEBOOK_PIXEL_ID`

## Deployment Process

### Automated Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys when you push to the `main` branch.

#### 1. Trigger Deployment

```bash
# Make changes to your code
git add .
git commit -m "feat: update profile settings"
git push origin main
```

#### 2. Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Select the latest workflow run
4. Monitor the progress through each step:
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Build application
   - ✅ Deploy to S3
   - ✅ Invalidate CloudFront
   - ✅ Health check

#### 3. Verify Deployment

After successful deployment:
- Visit `https://linktree.alexkm.com`
- Test all functionality
- Check admin panel access
- Verify mobile responsiveness

### Manual Deployment

If you need to deploy manually:

#### 1. Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify build output
ls -la dist/
```

#### 2. Deploy to S3

```bash
# Using AWS CLI
aws s3 sync dist/ s3://linktree.alexkm.com --delete --cache-control max-age=86400

# Or using AWS Console
# 1. Go to S3 console
# 2. Select your bucket
# 3. Upload all files from dist/ folder
# 4. Set proper cache headers
```

#### 3. Invalidate CloudFront

```bash
# Create invalidation
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

# Or using AWS Console
# 1. Go to CloudFront console
# 2. Select your distribution
# 3. Go to Invalidations tab
# 4. Create invalidation for "/*"
```

## Environment-Specific Configurations

### Development Environment

```env
# .env.development
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_dev_anon_key
VITE_APP_URL=http://localhost:8080
```

Commands:
```bash
npm run dev          # Start development server
npm run build:dev    # Build in development mode
```

### Staging Environment

```env
# .env.staging
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_anon_key
VITE_APP_URL=https://staging-linktree.alexkm.com
```

### Production Environment

```env
# .env.production (or .env)
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key
VITE_APP_URL=https://linktree.alexkm.com
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Performance Optimization

### Build Optimization

The build process includes several optimizations:

```bash
# Standard build (recommended)
npm run build

# Development build (for debugging)
npm run build:dev

# Preview production build locally
npm run preview
```

### CloudFront Cache Configuration

Optimal cache settings:

| File Type | Cache Duration | Path Pattern |
|-----------|----------------|--------------|
| HTML | 5 minutes | `*.html` |
| CSS/JS | 1 year | `*.css`, `*.js` |
| Images | 1 month | `*.jpg`, `*.png`, `*.svg` |
| Fonts | 1 year | `*.woff`, `*.woff2` |

### S3 Transfer Acceleration

For faster uploads, enable S3 Transfer Acceleration:

1. Go to S3 bucket properties
2. Enable Transfer Acceleration
3. Update deployment scripts to use accelerated endpoint

## Monitoring and Health Checks

### Automated Health Checks

The GitHub Actions workflow includes health checks:

```yaml
- name: Health check
  run: |
    sleep 30
    curl -f https://linktree.alexkm.com || exit 1
```

### Manual Health Checks

After deployment, verify:

✅ **Basic Functionality**
- [ ] Site loads without errors
- [ ] Profile information displays
- [ ] Links are clickable and tracked
- [ ] Admin panel is accessible

✅ **Performance**
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile performance is good

✅ **SEO**
- [ ] Meta tags are correct
- [ ] Open Graph data is present
- [ ] Sitemap is accessible
- [ ] robots.txt is correct

### Monitoring Tools

1. **AWS CloudWatch**: Monitor CloudFront and S3 metrics
2. **Google Analytics**: Track user behavior and performance
3. **Supabase Dashboard**: Monitor database performance and usage
4. **Uptime monitoring**: Set up external health checks

## Rollback Procedures

### Quick Rollback

If deployment fails, quickly rollback:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or restore from S3 version
aws s3 sync s3://linktree.alexkm.com-backup/ s3://linktree.alexkm.com/
```

### Database Rollback

If database migration fails:

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run rollback scripts if available
4. Restore from database backup

## Troubleshooting

### Common Deployment Issues

#### 1. Build Failures

**Error**: `npm run build` fails
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Environment Variable Issues

**Error**: Supabase connection fails
**Solution**:
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure API keys are valid

#### 3. CloudFront Issues

**Error**: Site shows old content
**Solution**:
```bash
# Force CloudFront invalidation
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### 4. GitHub Actions Failures

**Error**: AWS credentials invalid
**Solution**:
- Verify GitHub secrets are set correctly
- Check IAM user permissions
- Ensure AWS region is correct

### Debug Commands

```bash
# Check build output
npm run build && ls -la dist/

# Test production build locally
npm run build && npm run preview

# Check environment variables
env | grep VITE_

# Verify AWS credentials
aws sts get-caller-identity

# Test S3 sync (dry run)
aws s3 sync dist/ s3://linktree.alexkm.com --dryrun
```

## Security Considerations

### Deployment Security

✅ **Secrets Management**
- Use GitHub Secrets for sensitive data
- Never commit credentials to repository
- Rotate keys regularly

✅ **Access Control**
- Principle of least privilege for IAM users
- Restrict GitHub Actions permissions
- Monitor deployment logs

✅ **HTTPS Enforcement**
- SSL certificates properly configured
- HTTP redirects to HTTPS
- Security headers configured

### Post-Deployment Security

1. **Monitor access logs** for unusual activity
2. **Set up alerts** for failed login attempts
3. **Regular security audits** of dependencies
4. **Keep dependencies updated** with security patches

## Maintenance

### Regular Tasks

#### Weekly
- [ ] Monitor site performance
- [ ] Check error logs
- [ ] Review analytics data
- [ ] Test all functionality

#### Monthly
- [ ] Update dependencies
- [ ] Review and rotate access keys
- [ ] Check SSL certificate expiration
- [ ] Backup database and configurations

#### Quarterly
- [ ] Security audit and penetration testing
- [ ] Performance optimization review
- [ ] Cost optimization review
- [ ] Disaster recovery testing

### Backup Procedures

1. **Database Backup**: Automated via Supabase
2. **Code Backup**: Git repository with multiple remotes
3. **Configuration Backup**: Document all settings
4. **Asset Backup**: S3 versioning enabled

## Advanced Deployment

### Blue-Green Deployment

For zero-downtime deployments:

1. Set up two identical environments (blue/green)
2. Deploy to inactive environment
3. Test thoroughly
4. Switch DNS to new environment
5. Keep old environment as backup

### Multi-Region Deployment

For global performance:

1. Deploy to multiple AWS regions
2. Set up Route 53 latency-based routing
3. Configure regional CloudFront distributions
4. Implement database replication

### Staging Environment

Set up a staging environment:

```yaml
# .github/workflows/staging.yml
name: Deploy to Staging
on:
  push:
    branches: [ develop ]
# Similar to production but deploys to staging domain
```

## Performance Metrics

### Target Metrics

- **Page Load Time**: < 2 seconds
- **Lighthouse Performance**: > 90
- **First Contentful Paint**: < 1.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3 seconds

### Monitoring

Set up monitoring for:
- Core Web Vitals
- Error rates
- User engagement
- Conversion rates
- System uptime

## Support and Documentation

### Getting Help

1. **Check documentation** in `/docs` folder
2. **Review GitHub Issues** for similar problems
3. **Check service status** pages:
   - [AWS Status](https://status.aws.amazon.com/)
   - [Supabase Status](https://status.supabase.com/)
   - [GitHub Status](https://www.githubstatus.com/)

### Documentation

Keep these documents updated:
- Deployment runbook
- Incident response procedures
- Architecture diagrams
- API documentation
- User guides

This deployment guide ensures a reliable, secure, and maintainable deployment process for FlexiBio Builder.