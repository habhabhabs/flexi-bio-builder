# SQL Scripts Guide

This directory contains troubleshooting and maintenance SQL scripts for the FlexiBio Builder application.

## 📁 Script Categories

### 🔧 Troubleshooting Scripts

#### `debug_policies.sql`
**Purpose**: Comprehensive diagnostic script to identify database issues

**Use When**:
- Experiencing 500 errors on the public site
- Admin login issues or access problems
- Database queries failing unexpectedly

**What It Checks**:
- Table existence and structure
- Row Level Security (RLS) status
- Current security policies
- Foreign key constraints
- Data integrity

**How to Use**:
```bash
# In Supabase SQL Editor
-- Run the entire script to get a complete diagnostic report
-- Review each section's output to identify issues
```

#### `fix_500_errors.sql`
**Purpose**: Emergency fix for public site 500 errors

**Use When**:
- Public site is returning 500 errors
- Users cannot view links or profile
- Database policies are blocking public access

**What It Fixes**:
- Resets RLS policies to ensure public read access
- Creates safe admin write policies
- Handles missing admin_users table gracefully
- Ensures public routes work immediately

**How to Use**:
```bash
# Emergency use - run this if the public site is down
# This script prioritizes public access over admin functionality
```

### 🔑 Admin User Management

#### `add_admin_user.sql`
**Purpose**: Add admin access for existing Supabase users

**Use When**:
- Need to grant admin access to a user
- Setting up the first admin user
- User exists in Supabase Auth but not in admin_users table

**Before Running**:
1. **Update the email address** in the script:
   ```sql
   -- Change 'me@alexkm.com' to the actual admin email
   WHERE email = 'your-admin@example.com'
   ```
2. **Verify the user exists** in Supabase Auth Users table

**How to Use**:
```bash
# 1. Edit the script with the correct email
# 2. Run in Supabase SQL Editor
# 3. Check the output to verify success
```

### 🛠️ Database Fixes

#### `fix_foreign_key_constraint.sql` (Comprehensive)
**Purpose**: Comprehensive fix for self-referencing foreign key issues

**Use When**:
- Admin user creation fails with foreign key errors
- Cannot create the first admin user
- Database integrity issues with admin_users table

**What It Fixes**:
- Removes problematic self-referencing constraints
- Adds safer check constraints
- Cleans up invalid references
- Makes created_by field properly nullable

#### `fix_foreign_key_simple.sql` (Quick Fix)
**Purpose**: Simple, fast fix for foreign key constraint issues

**Use When**:
- Need a quick fix for admin user creation errors
- Want minimal changes to the database
- Emergency situation requiring immediate resolution

**What It Does**:
- Removes the problematic constraint only
- Cleans up orphaned references
- Allows normal admin user operations

#### `fix_infinite_recursion.sql`
**Purpose**: Fix infinite recursion in admin_users RLS policies

**Use When**:
- Admin queries cause infinite loops
- Admin panel becomes unusable
- Database timeouts on admin_users table operations

**What It Fixes**:
- Removes recursive policy definitions
- Creates simple, non-recursive policies
- Allows normal admin operations without loops

## 🚀 Usage Workflows

### 🆘 Emergency Site Recovery
If the public site is returning 500 errors:

1. **Run diagnostics**:
   ```sql
   -- Execute debug_policies.sql
   ```

2. **Apply emergency fix**:
   ```sql
   -- Execute fix_500_errors.sql
   ```

3. **Test public access**:
   - Visit the main site
   - Verify links and profile load correctly

### 👤 Setting Up Admin Users

1. **For the first admin**:
   ```sql
   -- Edit and run add_admin_user.sql
   -- Update email to match your Supabase Auth user
   ```

2. **If admin creation fails**:
   ```sql
   -- Run fix_foreign_key_simple.sql first
   -- Then retry add_admin_user.sql
   ```

### 🔧 Fixing Admin Panel Issues

1. **If admin login/queries fail**:
   ```sql
   -- Run debug_policies.sql to identify issues
   -- Run fix_infinite_recursion.sql if needed
   ```

2. **If admin user management fails**:
   ```sql
   -- Run fix_foreign_key_constraint.sql
   -- This provides comprehensive foreign key fixes
   ```

## ⚠️ Important Notes

### Script Safety
- **Always backup** your database before running fix scripts
- **Test in development** environment first when possible
- **Read script output** carefully to verify success

### Execution Order
When multiple issues exist, run scripts in this order:
1. `debug_policies.sql` (diagnosis)
2. `fix_infinite_recursion.sql` (if admin queries fail)
3. `fix_foreign_key_simple.sql` (if user creation fails)
4. `fix_500_errors.sql` (if public site fails)
5. `add_admin_user.sql` (to create admin users)

### Email Configuration
- **Always update email addresses** in scripts before running
- **Verify users exist** in Supabase Auth before granting admin access
- **Use production email addresses** for production databases

### Production vs Development
- **Development**: Safe to experiment with all scripts
- **Production**: Use `debug_policies.sql` first, then only necessary fixes
- **Staging**: Test the exact sequence you plan to use in production

## 📊 Script Outcomes

### Success Indicators
- Scripts complete without errors
- Test queries return expected results
- Public site loads correctly
- Admin panel functions normally

### Failure Indicators
- SQL errors during script execution
- Continued 500 errors after fixes
- Admin panel still inaccessible
- Foreign key constraint violations

### Post-Script Verification
Always verify after running scripts:
```sql
-- Test public access
SELECT COUNT(*) FROM public.links WHERE is_active = true;
SELECT COUNT(*) FROM public.profile_settings;

-- Test admin access (if logged in)
SELECT COUNT(*) FROM public.admin_users WHERE is_active = true;
```

## 🔗 Related Documentation

- **[Migration Guide](./run_migrations.md)** - Database schema setup
- **[Main README](../README.md)** - Complete project documentation
- **[Supabase Setup](../docs/SUPABASE_SETUP.md)** - Database configuration
- **[Troubleshooting](../docs/TROUBLESHOOTING.md)** - Common issues and solutions