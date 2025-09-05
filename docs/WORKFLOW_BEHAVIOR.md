# GitHub Workflows Behavior

This document explains how the GitHub Actions workflows are configured and when they trigger.

## Workflow Overview

The repository has two main workflows:

1. **Security Checks** (`security-checks.yml`) - Runs security scans on all PRs
2. **Deploy to S3** (`deploy.yml`) - Runs security checks and deploys to production

## Security Checks Workflow

**File**: `.github/workflows/security-checks.yml`

### When it runs:
- ✅ **All pull requests** to the `main` branch
- ✅ **Manual trigger** via workflow dispatch

### What it does:
- Runs custom security scanner
- Performs ESLint checks
- Scans for dependency vulnerabilities (npm audit)
- Runs Semgrep, CodeQL, TruffleHog, and Snyk (if tokens provided)
- Creates SARIF reports in GitHub Security tab
- Uses `continue-on-error: true` to avoid blocking PRs

### Behavior:
- **Non-blocking**: PRs can be merged even if security checks find issues
- **Informational**: Results appear in PR checks and Security tab
- **Comprehensive**: Multiple security tools provide layered protection

## Deploy Workflow

**File**: `.github/workflows/deploy.yml`

### When it runs:
- ✅ **Push to main branch** (always)
- ✅ **Pull requests from `habhabhabs` user only**
- ❌ **Pull requests from other users** (skipped)

### What it does:

#### For ALL triggers (pushes and allowed PRs):
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. **Run security scan** (blocks workflow if failed)
5. **Run ESLint** (blocks workflow if failed)

#### For pushes to main ONLY:
6. Build application with environment variables
7. Configure AWS credentials
8. Deploy to S3 bucket
9. Invalidate CloudFront cache
10. Perform health check

### Behavior:
- **Security First**: Always runs security checks before any deployment
- **User Restricted**: Only `habhabhabs` can trigger deployment workflow via PR
- **Push-to-Deploy**: Actual deployment only happens on pushes to main
- **Blocking**: Security failures prevent deployment
- **Health Verified**: Post-deployment health check ensures site is working

## Workflow Logic

```yaml
# Job runs if:
if: |
  (github.event_name == 'push' && github.ref == 'refs/heads/main') ||
  (github.event_name == 'pull_request' && github.actor == 'habhabhabs')

# Deployment steps only run if:
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

## Practical Examples

### Scenario 1: Push to main by habhabhabs
1. ✅ Deploy workflow runs
2. ✅ Security checks run (blocking)
3. ✅ Build and deployment happens
4. ✅ Site is updated

### Scenario 2: PR from habhabhabs
1. ✅ Security workflow runs (non-blocking)
2. ✅ Deploy workflow runs 
3. ✅ Security checks run (blocking)
4. ❌ Build/deployment steps skipped (PR only)

### Scenario 3: PR from external contributor
1. ✅ Security workflow runs (non-blocking) 
2. ❌ Deploy workflow skipped entirely
3. ✅ PR can still be reviewed and merged

### Scenario 4: Security check failure
1. ❌ Deploy workflow stops at security check
2. ❌ No build or deployment happens
3. ❌ Issue must be fixed before deployment

## Security Benefits

### Defense in Depth:
- **Two separate security workflows** catch different issues
- **Multiple security tools** provide comprehensive coverage
- **Pre-deployment checks** prevent vulnerable code from reaching production

### Access Control:
- **User restrictions** prevent unauthorized deployments
- **Branch protection** requires PRs and approvals
- **Automated security** reduces human error

### Audit Trail:
- **All deployments logged** in GitHub Actions
- **Security reports** stored in GitHub Security tab
- **PR history** shows all changes and reviews

## Troubleshooting

### Deploy workflow not running on PR
- ✅ Check if PR is from `habhabhabs` user
- ✅ Verify workflow file syntax is valid
- ✅ Ensure repository has Actions enabled

### Security checks failing
- ✅ Run `npm run security:full` locally
- ✅ Fix any hardcoded credentials or security issues
- ✅ Update dependencies with `npm audit fix`

### Deployment not happening
- ✅ Verify push is to `main` branch
- ✅ Check that security checks passed
- ✅ Ensure all required GitHub secrets are set

### External PRs blocked
- ✅ This is intentional for security
- ✅ External PRs still get security checks
- ✅ PRs can be merged normally by maintainers

## Required GitHub Secrets

For the deploy workflow to work, these secrets must be configured:

**Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

**Optional:**
- `VITE_GOOGLE_ANALYTICS_ID`
- `VITE_GOOGLE_TAG_MANAGER_ID`
- `VITE_FACEBOOK_PIXEL_ID`
- `AWS_REGION` (defaults to us-east-1)
- `SEMGREP_APP_TOKEN` (for enhanced security scanning)
- `SNYK_TOKEN` (for vulnerability scanning)

## Best Practices

1. **Always test locally** before pushing:
   ```bash
   npm run security:full
   npm run lint
   npm run build
   ```

2. **Keep dependencies updated**:
   ```bash
   npm audit fix
   npm update
   ```

3. **Review security findings** in GitHub Security tab

4. **Monitor deployment logs** for any issues

5. **Use feature branches** and create PRs for all changes

6. **Never commit secrets** - use environment variables and GitHub secrets