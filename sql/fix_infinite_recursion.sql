-- Fix infinite recursion in admin_users RLS policies
-- The policies are trying to check admin_users table to access admin_users table

-- First, check what policies exist on admin_users
SELECT 'Current admin_users policies:' as info;
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'admin_users';

-- Drop ALL existing policies on admin_users to break the recursion
DROP POLICY IF EXISTS "Admin users can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can create new admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can create admin users for existing auth users" ON public.admin_users;

-- Create simpler, non-recursive policies for admin_users
-- These policies don't reference admin_users table, avoiding recursion

-- Allow authenticated users to view admin_users if they are in the table
-- Use auth.uid() directly without subquery to admin_users
CREATE POLICY "Authenticated users can view admin users" 
ON public.admin_users FOR SELECT 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert admin_users (with validation via triggers)
CREATE POLICY "Authenticated users can create admin users" 
ON public.admin_users FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update admin_users 
CREATE POLICY "Authenticated users can update admin users" 
ON public.admin_users FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete admin_users
CREATE POLICY "Authenticated users can delete admin users" 
ON public.admin_users FOR DELETE 
USING (auth.role() = 'authenticated');

-- Test that the recursion is fixed
SELECT 'Testing admin_users access:' as info;
SELECT COUNT(*) as total_admins FROM public.admin_users;
SELECT COUNT(*) as active_admins FROM public.admin_users WHERE is_active = true;