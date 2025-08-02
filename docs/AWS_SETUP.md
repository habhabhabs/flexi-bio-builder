# AWS S3 + CloudFront Setup Guide

This guide provides step-by-step instructions for deploying FlexiBio Builder to AWS S3 with CloudFront CDN, following security best practices and the principle of least privilege.

## Prerequisites

- AWS Account with billing enabled
- AWS CLI installed and configured (optional but recommended)
- Domain name registered (for custom domain setup)
- Completed Supabase setup

## Step 1: Create S3 Bucket

### 1.1 Create the Bucket

1. Sign in to the AWS Management Console
2. Navigate to **S3** service
3. Click **"Create bucket"**
4. Configure bucket settings:
   - **Bucket name**: `linktree.alexkm.com` (must match your domain)
   - **AWS Region**: `us-east-1` (recommended for CloudFront)
   - **Block Public Access**: Keep "Block all public access" CHECKED ✅ (for security)
   - Leave other settings as default
5. Click **"Create bucket"**

### 1.2 Skip Static Website Hosting

**Note**: We will NOT enable static website hosting because we're using CloudFront Origin Access Control for better security. CloudFront will serve the files directly from the S3 bucket without making it publicly accessible.

## Step 2: Create IAM User for GitHub Actions

### 2.1 Create IAM Policy (Principle of Least Privilege)

1. Navigate to **IAM** service
2. Click **"Policies"** in the left sidebar
3. Click **"Create policy"**
4. Select **JSON** tab
5. Paste the following policy (replace `your-bucket-name` and `your-distribution-id`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListBucketContents",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::linktree.alexkm.com"
        },
        {
            "Sid": "ManageBucketObjects",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::linktree.alexkm.com/*"
        },
        {
            "Sid": "InvalidateCloudFrontDistribution",
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "arn:aws:cloudfront::*:distribution/YOUR_DISTRIBUTION_ID"
        }
    ]
}
```

6. Click **"Next: Tags"** (add tags if desired)
7. Click **"Next: Review"**
8. Name the policy: `FlexiBioBuilderDeploymentPolicy`
9. Add description: `Minimal permissions for FlexiBio Builder deployment to S3 and CloudFront invalidation`
10. Click **"Create policy"**

### 2.2 Create IAM User

1. In IAM, click **"Users"** in the left sidebar
2. Click **"Add users"**
3. Configure user:
   - **User name**: `flexibio-github-actions`
   - **Access type**: Access key - Programmatic access only
4. Click **"Next: Permissions"**
5. Click **"Attach existing policies directly"**
6. Search for and select `FlexiBioBuilderDeploymentPolicy`
7. Click **"Next: Tags"** (add tags if desired)
8. Click **"Next: Review"**
9. Click **"Create user"**
10. **IMPORTANT**: Copy and securely store:
    - **Access key ID**
    - **Secret access key**
    
    You won't be able to view the secret key again!

## Step 3: Set Up CloudFront Distribution with Origin Access Control

### 3.1 Create Origin Access Control (OAC)

1. Navigate to **CloudFront** service
2. In the left sidebar, click **"Origin access"**
3. Click **"Create origin access control"**
4. Configure:
   - **Name**: `linktree-alexkm-oac`
   - **Description**: `Origin access control for linktree.alexkm.com S3 bucket`
   - **Origin type**: S3
   - **Signing behavior**: Sign requests (recommended)
   - **Origin access control**: Leave default settings
5. Click **"Create"**

### 3.2 Create Distribution

1. Navigate back to **CloudFront** → **Distributions**
2. Click **"Create distribution"**
3. Configure origin settings:
   - **Origin domain**: Select your S3 bucket from dropdown (linktree.alexkm.com)
   - **Origin path**: Leave empty
   - **Origin access**: Origin access control settings (recommended)
   - **Origin access control**: Select the OAC you created (`linktree-alexkm-oac`)
   - **Enable Origin Shield**: No (optional, adds cost)
4. Configure default cache behavior:
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD (sufficient for static site)
   - **Cache policy**: CachingOptimized
   - **Origin request policy**: None (not needed for static content)
   - **Response headers policy**: SecurityHeadersPolicy (optional, recommended for security)
5. Configure distribution settings:
   - **Price class**: Use all edge locations (best performance)
   - **Alternate domain name (CNAME)**: `linktree.alexkm.com`
   - **Custom SSL certificate**: Request or import certificate
   - **Default root object**: `index.html`
   - **Standard logging**: Off (or configure if you need access logs)
6. Click **"Create distribution"**
7. **IMPORTANT**: Copy the policy statement that appears in the yellow banner
8. Wait for deployment (usually 10-15 minutes)
9. Note the **Distribution ID** (needed for GitHub Actions)

### 3.3 Update S3 Bucket Policy for CloudFront Access

After creating the distribution, AWS will show you a policy to add to your S3 bucket.

1. Go back to **S3** service
2. Select your bucket (`linktree.alexkm.com`)
3. Go to **Permissions** tab
4. Scroll to **Bucket policy**
5. Click **"Edit"**
6. Paste the policy provided by CloudFront (it will look like this):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::linktree.alexkm.com/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
                }
            }
        }
    ]
}
```

7. Replace `YOUR_ACCOUNT_ID` and `YOUR_DISTRIBUTION_ID` with your actual values
8. Click **"Save changes"**

**Security Benefits:**
- ✅ **S3 bucket remains completely private** - no public access at all
- ✅ **Only CloudFront can access files** - protected by AWS service authentication
- ✅ **Conditional access control** - restricted to your specific distribution
- ✅ **No direct S3 URLs work** - all access must go through CloudFront
- ✅ **Audit trail maintained** - all access is logged and traceable

### 3.4 Configure Custom Error Pages (for SPA routing)

1. Select your distribution
2. Go to **Error pages** tab
3. Click **"Create custom error response"**
4. Configure:
   - **HTTP error code**: 403 Forbidden
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: 200 OK
5. Click **"Create custom error response"**
6. Repeat for 404 errors:
   - **HTTP error code**: 404 Not Found
   - **Response page path**: `/index.html`
   - **HTTP response code**: 200 OK

## Step 4: Configure Domain (Route 53)

### 4.1 Create Hosted Zone (if not exists)

1. Navigate to **Route 53** service
2. Click **"Hosted zones"**
3. If your domain doesn't have a hosted zone, click **"Create hosted zone"**
4. Enter your domain name: `alexkm.com`
5. Click **"Create hosted zone"**
6. Note the **Name servers** and update them with your domain registrar

### 4.2 Create DNS Records

1. Select your hosted zone
2. Click **"Create record"**
3. Configure A record for subdomain:
   - **Record name**: `linktree`
   - **Record type**: A
   - **Alias**: Yes
   - **Route traffic to**: Alias to CloudFront distribution
   - **Choose distribution**: Select your CloudFront distribution
4. Click **"Create records"**

## Step 5: SSL Certificate Setup

### 5.1 Request Certificate (if not done during CloudFront setup)

1. Navigate to **AWS Certificate Manager** (ACM)
2. Ensure you're in **us-east-1** region (required for CloudFront)
3. Click **"Request certificate"**
4. Configure:
   - **Certificate type**: Request a public certificate
   - **Domain names**: 
     - `linktree.alexkm.com`
     - `*.alexkm.com` (optional, for wildcard)
   - **Validation method**: DNS validation
5. Click **"Request"**
6. Follow DNS validation steps (automatically handled if using Route 53)
7. Wait for certificate status to become "Issued"

### 5.2 Associate Certificate with CloudFront

1. Go back to **CloudFront**
2. Select your distribution
3. Click **"Edit"**
4. In **Custom SSL certificate**, select your certificate
5. Click **"Save changes"**
6. Wait for deployment to complete

## Step 6: Configure GitHub Actions Secrets

After completing the AWS setup, you'll need to configure GitHub Actions secrets for automated deployment.

### 6.1 Required AWS Secrets

From the setup above, you'll need these secrets:

| Secret Name | Value Source | Description |
|-------------|--------------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user credentials (Step 2.2) | For AWS authentication |
| `AWS_SECRET_ACCESS_KEY` | IAM user credentials (Step 2.2) | For AWS authentication |
| `S3_BUCKET_NAME` | Your S3 bucket name | Target deployment bucket |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution (Step 3.1) | For cache invalidation |
| `AWS_REGION` | Your chosen AWS region | Usually `us-east-1` |

### 6.2 Complete GitHub Secrets Setup

For complete instructions on setting up ALL GitHub Actions secrets (including Supabase, analytics, and application configuration), see:

**📚 [GitHub Secrets Configuration Guide](./GITHUB_SECRETS.md)**

This guide covers:
- All required and optional secrets
- Step-by-step setup instructions
- Security best practices
- Troubleshooting common issues

## Step 7: Test Deployment

### 7.1 Trigger Deployment

1. Make a commit to your `main` branch
2. Push to GitHub
3. Check **Actions** tab to monitor deployment
4. Wait for deployment to complete

### 7.2 Verify Deployment

1. Visit `https://linktree.alexkm.com`
2. Verify that:
   - Site loads correctly
   - HTTPS is working
   - All links function properly
   - Admin panel is accessible
   - Mobile responsiveness works

## Step 8: Performance Optimization

### 8.1 CloudFront Cache Settings

For better performance, consider these cache settings:

1. **Static assets** (JS, CSS, images): Long cache duration (1 year)
2. **HTML files**: Short cache duration (5 minutes) or no-cache
3. **API responses**: No cache (if using Supabase edge functions)

### 8.2 S3 Transfer Acceleration (Optional)

For faster uploads during deployment:

1. Go to your S3 bucket
2. Navigate to **Properties**
3. Find **Transfer acceleration**
4. Click **"Edit"** and enable it
5. Update your GitHub Actions workflow to use accelerated endpoint

## Security Considerations

### 8.1 IAM Security Best Practices

✅ **Implemented:**
- Principle of least privilege (minimal permissions)
- Programmatic access only (no console access)
- Specific resource ARNs (not wildcards)

✅ **Additional Recommendations:**
- Rotate access keys regularly (every 90 days)
- Monitor CloudTrail for unusual API activity
- Set up billing alerts
- Use AWS Organizations for account management

### 8.2 S3 Security Best Practices

✅ **Implemented:**
- **Private S3 bucket** with "Block all public access" enabled
- **Origin Access Control (OAC)** - only CloudFront can access the bucket
- **Conditional IAM policy** - restricts access to specific CloudFront distribution
- **No direct S3 access** - bucket is completely private

✅ **Additional Recommendations:**
- Enable S3 access logging for audit trails
- Enable versioning for accidental deletion protection
- Configure lifecycle policies for cost optimization
- Set up S3 bucket notifications for security monitoring

### 8.3 CloudFront Security Best Practices

✅ **Implemented:**
- **Origin Access Control (OAC)** - modern, secure access method
- **HTTPS redirect enforced** - all traffic encrypted
- **Custom SSL certificate** - secure domain validation
- **Private origin** - S3 bucket not publicly accessible
- **Security headers policy** - additional protection headers

✅ **Additional Recommendations:**
- Configure AWS WAF for DDoS protection
- Set up real-time logs for monitoring
- Enable response headers policy for security headers

## Monitoring and Maintenance

### 8.1 CloudWatch Alarms

Set up alarms for:
- High error rates (4xx, 5xx responses)
- Unusual traffic patterns
- High data transfer costs

### 8.2 Cost Management

- Monitor S3 storage costs
- Monitor CloudFront data transfer costs
- Set up billing alerts
- Review and optimize cache policies

### 8.3 Regular Maintenance Tasks

- Review and rotate IAM access keys
- Update SSL certificates before expiration
- Monitor security advisories
- Review and update cache policies
- Test disaster recovery procedures

## Troubleshooting

### Common Issues

1. **403 Forbidden errors**
   - Check S3 bucket policy
   - Verify CloudFront origin configuration
   - Check file permissions

2. **SSL certificate issues**
   - Ensure certificate is in us-east-1 region
   - Verify domain validation
   - Check CloudFront distribution configuration

3. **SPA routing issues**
   - Verify custom error pages are configured
   - Check that error responses return 200 status
   - Ensure index.html is set as default root object

4. **GitHub Actions deployment failures**
   - Verify AWS credentials are correct
   - Check IAM policy permissions
   - Review GitHub Actions logs

### Useful AWS CLI Commands

```bash
# Sync files to S3
aws s3 sync dist/ s3://linktree.alexkm.com --delete

# Create CloudFront invalidation
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

# List S3 bucket contents
aws s3 ls s3://linktree.alexkm.com --recursive

# Check CloudFront distribution status
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

## Cost Estimation

### Monthly Costs (Approximate)

- **S3 Storage**: $0.023/GB (~$0.10 for typical site)
- **S3 Requests**: $0.0004/1000 requests (~$1-5)
- **CloudFront Data Transfer**: $0.085/GB (~$5-20)
- **Route 53 Hosted Zone**: $0.50/month
- **SSL Certificate**: Free (AWS ACM)

**Total estimated monthly cost**: $6-26 (depending on traffic)

## Next Steps

After completing AWS setup:
1. Configure monitoring and alerts
2. Set up backup procedures
3. Plan for scaling and performance optimization
4. Document runbook for common operations
5. Train team members on deployment procedures

For production environments, consider:
- Multi-region deployment for high availability
- AWS WAF for enhanced security
- AWS Shield for DDoS protection
- Professional support plan