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
   - **Block Public Access**: Uncheck "Block all public access" ⚠️
   - Check the acknowledgment box
   - Leave other settings as default
5. Click **"Create bucket"**

### 1.2 Configure Static Website Hosting

1. Select your newly created bucket
2. Go to **Properties** tab
3. Scroll to **Static website hosting**
4. Click **"Edit"**
5. Configure:
   - **Static website hosting**: Enable
   - **Hosting type**: Host a static website
   - **Index document**: `index.html`
   - **Error document**: `index.html` (for SPA routing)
6. Click **"Save changes"**
7. Note the **Bucket website endpoint** URL

### 1.3 Configure Bucket Policy

1. Go to **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **"Edit"**
4. Add the following policy (replace `your-bucket-name` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::linktree.alexkm.com/*"
        }
    ]
}
```

5. Click **"Save changes"**

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

## Step 3: Set Up CloudFront Distribution

### 3.1 Create Distribution

1. Navigate to **CloudFront** service
2. Click **"Create distribution"**
3. Configure origin settings:
   - **Origin domain**: Select your S3 bucket from dropdown
   - **Origin path**: Leave empty
   - **Origin access**: Public (bucket must be publicly readable)
4. Configure default cache behavior:
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache policy**: CachingOptimized
   - **Origin request policy**: CORS-S3Origin
5. Configure distribution settings:
   - **Price class**: Use all edge locations (best performance)
   - **Alternate domain name (CNAME)**: `linktree.alexkm.com`
   - **Custom SSL certificate**: Request or import certificate
   - **Default root object**: `index.html`
6. Click **"Create distribution"**
7. Wait for deployment (usually 10-15 minutes)
8. Note the **Distribution ID** (needed for GitHub Actions)

### 3.2 Configure Custom Error Pages (for SPA routing)

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

In your GitHub repository, add the following secrets:

### 6.1 Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

### 6.2 Add Required Secrets

Add each of the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | Your IAM user access key ID | From Step 2.2 |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user secret access key | From Step 2.2 |
| `CLOUDFRONT_DISTRIBUTION_ID` | Your CloudFront distribution ID | From Step 3.1 |
| `VITE_SUPABASE_URL` | Your Supabase project URL | From Supabase setup |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | From Supabase setup |

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
- Bucket-level public access (not account-level)
- Specific bucket policy for public read

✅ **Additional Recommendations:**
- Enable S3 access logging
- Enable versioning for accidental deletion protection
- Configure lifecycle policies for cost optimization

### 8.3 CloudFront Security Best Practices

✅ **Implemented:**
- HTTPS redirect enforced
- Custom SSL certificate
- Origin access control

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