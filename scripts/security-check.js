#!/usr/bin/env node

/**
 * Security Check Script
 * Scans the codebase for potential security issues and hardcoded credentials
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Patterns that indicate potential security issues
const SECURITY_PATTERNS = [
  {
    name: 'Hardcoded Supabase URLs',
    pattern: /https:\/\/[a-z0-9]+\.supabase\.co/g,
    severity: 'HIGH',
    allowedFiles: ['docs/', 'scripts/'],
  },
  {
    name: 'Hardcoded JWT tokens',
    pattern: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*/g,
    severity: 'CRITICAL',
    allowedFiles: ['docs/', 'scripts/'],
  },
  {
    name: 'AWS Access Keys',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    allowedFiles: ['docs/', 'scripts/'],
  },
  {
    name: 'Google Analytics IDs',
    pattern: /G-[A-Z0-9]{10}/g,
    severity: 'MEDIUM',
    allowedFiles: ['docs/', 'src/components/', 'scripts/'],
  },
  {
    name: 'Google Tag Manager IDs', 
    pattern: /GTM-[A-Z0-9]{7}/g,
    severity: 'MEDIUM',
    allowedFiles: ['docs/', 'src/components/', 'scripts/'],
  },
  {
    name: 'Hardcoded passwords',
    pattern: /password\s*[:=]\s*["'][^"']+["']/gi,
    severity: 'HIGH',
    allowedFiles: ['docs/', 'scripts/'],
  },
  {
    name: 'API keys in code',
    pattern: /(api[_-]?key|secret[_-]?key)\s*[:=]\s*["'][^"']+["']/gi,
    severity: 'HIGH',
    allowedFiles: ['docs/', 'scripts/'],
  },
];

// Files and directories to scan
const SCAN_PATTERNS = [
  'src/**/*.{ts,tsx,js,jsx}',
  '*.{ts,tsx,js,jsx,json}',
  '.github/**/*.{yml,yaml}',
];

// Files and directories to ignore
const IGNORE_PATTERNS = [
  'node_modules/',
  'dist/',
  'build/',
  '.git/',
  '.vite/',
  'package-lock.json',
  '*.log',
  'scripts/security-check.js', // Don't scan this script itself
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function isFileAllowed(filePath, allowedFiles) {
  if (!allowedFiles || allowedFiles.length === 0) return false;
  return allowedFiles.some(allowed => filePath.includes(allowed));
}

function scanFile(filePath) {
  if (shouldIgnoreFile(filePath)) return [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    for (const pattern of SECURITY_PATTERNS) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        // Check if this file is allowed to contain this pattern
        if (isFileAllowed(filePath, pattern.allowedFiles)) {
          continue; // Skip this issue for allowed files
        }
        
        issues.push({
          file: filePath,
          pattern: pattern.name,
          severity: pattern.severity,
          matches: matches,
          lineNumbers: getLineNumbers(content, pattern.pattern),
        });
      }
    }
    
    return issues;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

function getLineNumbers(content, pattern) {
  const lines = content.split('\n');
  const lineNumbers = [];
  
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      lineNumbers.push(index + 1);
    }
  });
  
  return lineNumbers;
}

function scanDirectory(dirPath) {
  const issues = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !shouldIgnoreFile(item)) {
        issues.push(...scanDirectory(itemPath));
      } else if (stat.isFile()) {
        issues.push(...scanFile(itemPath));
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}: ${error.message}`);
  }
  
  return issues;
}

function printResults(issues) {
  if (issues.length === 0) {
    console.log('\n✅ Security scan completed successfully!');
    console.log('No hardcoded credentials or security issues found.');
    return;
  }
  
  console.log('\n🚨 Security Issues Found:');
  console.log('=' .repeat(50));
  
  const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
  const highIssues = issues.filter(i => i.severity === 'HIGH');
  const mediumIssues = issues.filter(i => i.severity === 'MEDIUM');
  
  if (criticalIssues.length > 0) {
    console.log('\n🔴 CRITICAL Issues:');
    criticalIssues.forEach(printIssue);
  }
  
  if (highIssues.length > 0) {
    console.log('\n🟠 HIGH Issues:');
    highIssues.forEach(printIssue);
  }
  
  if (mediumIssues.length > 0) {
    console.log('\n🟡 MEDIUM Issues:');
    mediumIssues.forEach(printIssue);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total issues found: ${issues.length}`);
  console.log(`Critical: ${criticalIssues.length}, High: ${highIssues.length}, Medium: ${mediumIssues.length}`);
  
  if (criticalIssues.length > 0) {
    console.log('\n❌ Security scan FAILED: Critical issues must be resolved!');
    process.exit(1);
  }
}

function printIssue(issue) {
  console.log(`\n  File: ${issue.file}`);
  console.log(`  Issue: ${issue.pattern}`);
  console.log(`  Lines: ${issue.lineNumbers.join(', ')}`);
  console.log(`  Matches: ${issue.matches.length}`);
  issue.matches.forEach((match, index) => {
    if (index < 3) { // Show first 3 matches
      console.log(`    - ${match.substring(0, 50)}${match.length > 50 ? '...' : ''}`);
    }
  });
  if (issue.matches.length > 3) {
    console.log(`    ... and ${issue.matches.length - 3} more`);
  }
}

function main() {
  console.log('🔍 Running security scan...');
  console.log(`Scanning: ${projectRoot}`);
  
  const issues = scanDirectory(projectRoot);
  printResults(issues);
}

// Run the security check
main();