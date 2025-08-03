# Migration Execution Guide

## Run migrations in this exact order:

1. **First, run the original base migration:**
   ```sql
   -- Run: supabase/migrations/20250802145833_402a982c-1610-4c45-9b2f-bc0b456b1722.sql
   -- This creates the basic tables (links, profile_settings, link_analytics)
   ```

2. **Then run the hide footer option:**
   ```sql
   -- Run: supabase/migrations/20250802160000_add_hide_footer_option.sql
   -- This adds the hide_footer column to profile_settings
   ```

3. **Finally, run the complete RBAC system:**
   ```sql
   -- Run: supabase/migrations/20250802190000_complete_rbac_system.sql
   -- This creates admin_users table and all RBAC functionality
   ```

## Important Notes:

1. **Replace the admin email** in the final migration:
   - Change `admin@alexkm.com` to your actual admin email address
   - This email must match an existing user in Supabase Auth

2. **Skip these files** (they are now consolidated):
   - `20250802170000_implement_rbac_system.sql` ❌
   - `20250802180000_restrict_admin_user_creation.sql` ❌

3. **After running migrations:**
   - Create a Supabase account with your admin email
   - The system will automatically grant super_admin role to that email
   - You can then use the admin panel to manage other users

## Migration Dependencies:

- ✅ Base tables must exist first
- ✅ hide_footer column must be added before RBAC
- ✅ RBAC system creates admin_users and all security policies
- ✅ All validations and restrictions are included in the final migration

## Testing:

1. Try logging into `/admin` with your admin email
2. Check that magic links redirect to production domain
3. Verify user management works only for existing Supabase users
4. Test role-based permissions (super_admin, admin, editor)