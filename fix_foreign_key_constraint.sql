-- Fix the self-referencing foreign key constraint issue in admin_users table
-- This constraint can cause 500 errors during admin user creation and queries

-- First, check current admin_users data
SELECT 'Current admin_users data:' as info;
SELECT id, user_id, email, role, is_active, created_by FROM public.admin_users;

-- Drop the problematic self-referencing foreign key constraint
-- This allows the first admin to be created without referencing another admin
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_created_by_fkey;

-- Make created_by nullable and optional (it should be anyway for the first admin)
ALTER TABLE public.admin_users ALTER COLUMN created_by DROP NOT NULL;

-- Add a simple check constraint instead of foreign key to prevent issues
-- This ensures created_by references a valid admin_users.id when provided, but allows NULL
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_created_by_check 
CHECK (
  created_by IS NULL OR 
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = created_by)
);

-- Update any records where created_by might be invalid
UPDATE public.admin_users 
SET created_by = NULL 
WHERE created_by IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.admin_users a2 WHERE a2.id = admin_users.created_by);

-- Verify the fix
SELECT 'After fix - admin_users data:' as info;
SELECT id, user_id, email, role, is_active, created_by FROM public.admin_users;