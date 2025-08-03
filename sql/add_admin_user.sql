-- Add the admin user to admin_users table
-- This resolves the 406 error by ensuring the user exists

-- First, check if the user exists in auth.users
SELECT 'Checking auth.users for me@alexkm.com:' as info;
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'me@alexkm.com';

-- Check current admin_users table
SELECT 'Current admin_users table:' as info;
SELECT id, user_id, email, role, is_active FROM public.admin_users;

-- Insert the admin user if they don't exist
-- This assumes the user exists in auth.users with email 'me@alexkm.com'
INSERT INTO public.admin_users (user_id, email, role, is_active, created_at)
SELECT 
  au.id as user_id,
  au.email,
  'super_admin' as role,
  true as is_active,
  NOW() as created_at
FROM auth.users au
WHERE au.email = 'me@alexkm.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.admin_users adu 
    WHERE adu.user_id = au.id OR adu.email = au.email
  );

-- Verify the insert worked
SELECT 'After insert - admin_users table:' as info;
SELECT id, user_id, email, role, is_active FROM public.admin_users;

-- Test the specific query that was failing
SELECT 'Testing the failing query:' as info;
SELECT email FROM public.admin_users 
WHERE email = 'me@alexkm.com' AND is_active = true;