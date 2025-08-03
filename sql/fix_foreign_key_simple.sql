-- Simple fix for the self-referencing foreign key constraint issue
-- Remove the problematic constraint that causes 500 errors

-- First, check current admin_users data
SELECT 'Current admin_users data:' as info;
SELECT id, user_id, email, role, is_active, created_by FROM public.admin_users;

-- Drop the problematic self-referencing foreign key constraint
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_created_by_fkey;

-- Make created_by nullable (it should be for the first admin anyway)
ALTER TABLE public.admin_users ALTER COLUMN created_by DROP NOT NULL;

-- Clean up any invalid created_by references by setting them to NULL
-- This ensures no orphaned references exist
UPDATE public.admin_users 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
  AND created_by NOT IN (SELECT id FROM public.admin_users);

-- Verify the fix worked
SELECT 'After fix - admin_users data:' as info;
SELECT id, user_id, email, role, is_active, created_by FROM public.admin_users;

-- Check that we can now query admin_users without errors
SELECT 'Test query - count of active admins:' as info;
SELECT COUNT(*) as active_admin_count FROM public.admin_users WHERE is_active = true;