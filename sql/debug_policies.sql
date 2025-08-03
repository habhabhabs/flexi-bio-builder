-- Debug query to check current RLS policies and table status
-- Run this in Supabase SQL Editor to diagnose the 500 errors

-- 1. Check if tables exist
SELECT 'Tables exist:' as info;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('links', 'profile_settings', 'admin_users');

-- 2. Check RLS status
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('links', 'profile_settings', 'admin_users');

-- 3. Check current policies
SELECT 'Current Policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('links', 'profile_settings', 'admin_users')
ORDER BY tablename, policyname;

-- 4. Test public access to profile_settings (should work)
SELECT 'Profile Settings Test:' as info;
SELECT COUNT(*) as profile_count FROM public.profile_settings;

-- 5. Test public access to active links (should work)
SELECT 'Active Links Test:' as info;
SELECT COUNT(*) as active_links FROM public.links WHERE is_active = true;

-- 6. Check if admin_users table has data
SELECT 'Admin Users:' as info;
SELECT COUNT(*) as admin_count, 
       COUNT(CASE WHEN is_active = true THEN 1 END) as active_admin_count 
FROM public.admin_users;

-- 7. Check for any foreign key constraints that might be failing
SELECT 'Foreign Key Constraints:' as info;
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('links', 'profile_settings', 'admin_users');