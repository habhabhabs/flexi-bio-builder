# Security CI/CD Pipeline

This document describes the security checks that run automatically on pull requests to ensure code security and prevent credential leaks.

## Overview

The security pipeline consists of multiple layers of scanning:

1. **Custom Security Scanner** - Uses our internal `scripts/security-check.js`
2. **ESLint Security Rules** - Catches common security anti-patterns
3. **Dependency Vulnerability Scanning** - Uses npm audit to check for known vulnerabilities
4. **Static Analysis** - Semgrep for advanced security pattern detection
5. **Code Analysis** - GitHub CodeQL for comprehensive security analysis
6. **Secret Detection** - TruffleHog for exposed credentials in git history
7. **License Compliance** - Ensures all dependencies have compatible licenses

## Workflow Files

- `.github/workflows/security-checks.yml` - Runs on all pull requests
- `.github/workflows/deploy.yml` - Includes security checks before deployment

## Required GitHub Secrets (Optional)

While the security pipeline will run basic checks without any secrets, you can enhance it with these optional tokens:

### Semgrep (Optional)
- `SEMGREP_APP_TOKEN` - Enables advanced Semgrep features and result uploading

### Snyk (Optional)  
- `SNYK_TOKEN` - Enables Snyk vulnerability scanning with detailed reports

## Security Checks Performed

### 1. Custom Security Scanner

Our custom scanner checks for:
- ✅ Hardcoded Supabase URLs
- ✅ JWT tokens in source code  
- ✅ AWS access keys
- ✅ Google Analytics/Tag Manager IDs in wrong locations
- ✅ Hardcoded passwords
- ✅ API keys in source code

**Files scanned:** All `.ts`, `.tsx`, `.js`, `.jsx`, and `.json` files
**Exemptions:** Files in `docs/` and `scripts/` directories are allowed to contain certain patterns

### 2. ESLint Security Rules

Catches common JavaScript/TypeScript security issues like:
- Unsafe DOM manipulation
- Potential XSS vulnerabilities  
- Insecure randomness
- Dangerous eval() usage

### 3. NPM Audit

Scans `package-lock.json` for:
- Known vulnerabilities in dependencies
- Outdated packages with security fixes
- **Threshold:** Moderate severity and above

### 4. Semgrep Analysis

Advanced static analysis covering:
- Security audit rules
- Secret detection patterns
- TypeScript-specific security issues
- React security best practices

### 5. CodeQL Analysis

GitHub's semantic code analysis for:
- Complex security vulnerabilities
- Data flow analysis
- Taint tracking for user input

### 6. TruffleHog Secret Scanning

Scans git history for:
- API keys, tokens, and passwords
- Cloud service credentials
- Database connection strings
- **Mode:** Only verified secrets to reduce false positives

### 7. License Compliance

Ensures all production dependencies have:
- Compatible open source licenses
- No GPL or other restrictive licenses (configurable)

## Workflow Behavior

### Pull Request Workflow
- Runs on every pull request to `main`
- Most steps use `continue-on-error: true` to avoid blocking PRs
- Creates SARIF reports visible in GitHub Security tab
- Provides comprehensive summary of all security checks

### Deployment Workflow
- Runs security scan and ESLint before building
- **Blocks deployment** if critical security issues are found
- Ensures only secure code reaches production

## Interpreting Results

### ✅ Success
- All security checks passed
- No critical vulnerabilities found
- Safe to merge/deploy

### ⚠️ Warnings  
- Medium/low severity issues found
- Review findings but may proceed with caution
- Consider fixing in follow-up PR

### ❌ Failure
- Critical security issues detected
- **Must be resolved** before merging/deploying
- Check workflow logs for specific issues

## Local Development

Run security checks locally before pushing:

```bash
# Quick security scan
npm run security:check

# Full security analysis
npm run security:full

# ESLint security rules
npm run lint

# Dependency vulnerabilities
npm audit
```

## Customizing Security Rules

### Custom Scanner
Edit `scripts/security-check.js` to:
- Add new security patterns
- Modify severity levels
- Update file exemptions

### ESLint Rules
Edit `eslint.config.js` to:
- Enable additional security plugins
- Configure rule severity
- Add project-specific rules

## Security Best Practices

1. **Never commit secrets** - Use environment variables and GitHub secrets
2. **Keep dependencies updated** - Regularly run `npm audit fix`
3. **Review security warnings** - Don't ignore medium/high severity issues
4. **Use HTTPS everywhere** - No HTTP endpoints in production code
5. **Validate user input** - Sanitize and validate all user data
6. **Limit API permissions** - Use least privilege principle

## Troubleshooting

### Common Issues

**"npm audit found vulnerabilities"**
- Run `npm audit fix` to update vulnerable packages
- For unfixable vulnerabilities, consider alternative packages

**"ESLint security rule violation"**
- Review the specific rule that failed
- Fix the code or add eslint-disable comment with justification

**"Custom security scanner failed"**
- Check which pattern was detected
- Move secrets to environment variables
- Add file to exemption list if appropriate

**"Semgrep/CodeQL false positive"**
- Review the finding details
- Add suppression comment if confirmed false positive
- Update rules if pattern causes frequent false positives

### Getting Help

1. Check workflow logs for specific error messages
2. Review security findings in GitHub Security tab
3. Run checks locally to debug issues
4. Consult security team for complex vulnerabilities

## Maintenance

- Review and update security patterns monthly
- Keep security tools updated to latest versions
- Monitor for new vulnerability databases and rule sets
- Regularly audit exemptions and suppression rules