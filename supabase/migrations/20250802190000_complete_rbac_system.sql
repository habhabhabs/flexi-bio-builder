-- Complete RBAC System Migration
-- This migration creates the admin_users table and all related functionality

-- First, check if admin_users table already exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
        -- Create admin_users table for RBAC
        CREATE TABLE public.admin_users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by UUID REFERENCES public.admin_users(id),
          last_login TIMESTAMP WITH TIME ZONE
        );

        -- Enable RLS on admin_users
        ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can create new admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can create admin users for existing auth users" ON public.admin_users;

-- Create policies for admin_users table
CREATE POLICY "Admin users can view all admin users" 
ON public.admin_users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Super admins can manage all admin users" 
ON public.admin_users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role = 'super_admin' AND is_active = true
  )
);

-- Create policy that requires existing auth user (basic check)
CREATE POLICY "Admins can create admin users for existing auth users" 
ON public.admin_users FOR INSERT 
WITH CHECK (
  -- User must be an admin or super admin
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin') AND is_active = true
  )
);

-- Update existing policies to use admin_users table
DROP POLICY IF EXISTS "Authenticated users can manage links" ON public.links;
DROP POLICY IF EXISTS "Authenticated users can manage profile" ON public.profile_settings;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON public.link_analytics;
DROP POLICY IF EXISTS "Admin users can manage links" ON public.links;
DROP POLICY IF EXISTS "Admin users can manage profile" ON public.profile_settings;
DROP POLICY IF EXISTS "Admin users can view analytics" ON public.link_analytics;

-- New policies based on admin_users
CREATE POLICY "Admin users can manage links" 
ON public.links FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin users can manage profile" 
ON public.profile_settings FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin users can view analytics" 
ON public.link_analytics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Create function to automatically update admin_users timestamp
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to validate admin user creation
CREATE OR REPLACE FUNCTION public.validate_admin_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user_id exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id) THEN
    RAISE EXCEPTION 'User must exist in Supabase authentication before being granted admin access';
  END IF;
  
  -- Check if email matches auth.users email
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.user_id AND email = NEW.email) THEN
    RAISE EXCEPTION 'Email must match the authenticated user email';
  END IF;
  
  -- Check if admin user already exists for this user_id
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = NEW.user_id) THEN
    RAISE EXCEPTION 'Admin user already exists for this user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to validate admin user creation
DROP TRIGGER IF EXISTS validate_admin_user_before_insert ON public.admin_users;
CREATE TRIGGER validate_admin_user_before_insert
    BEFORE INSERT ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_admin_user_creation();

-- Create function to get existing auth users for admin selection
CREATE OR REPLACE FUNCTION public.get_available_auth_users()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  created_at TIMESTAMPTZ,
  is_admin BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::VARCHAR,
    au.created_at,
    (adu.user_id IS NOT NULL) as is_admin
  FROM auth.users au
  LEFT JOIN public.admin_users adu ON au.id = adu.user_id
  WHERE au.email IS NOT NULL
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (will be restricted by RLS)
GRANT EXECUTE ON FUNCTION public.get_available_auth_users() TO authenticated;

-- Create view for admin dashboard
DROP VIEW IF EXISTS public.admin_dashboard_stats;
CREATE VIEW public.admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.links WHERE is_active = true) as active_links,
  (SELECT COUNT(*) FROM public.links) as total_links,
  (SELECT COALESCE(SUM(click_count), 0) FROM public.links) as total_clicks,
  (SELECT COUNT(*) FROM public.admin_users WHERE is_active = true) as active_admins,
  (SELECT COUNT(DISTINCT DATE(clicked_at)) FROM public.link_analytics WHERE clicked_at >= NOW() - INTERVAL '30 days') as active_days_last_month;

-- Enable RLS on the view
ALTER VIEW public.admin_dashboard_stats SET (security_invoker = on);

-- Grant access to the view
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;

-- Insert initial super admin (replace with your actual admin email)
-- This should be done manually in production with the actual admin email
-- Disable trigger temporarily to allow ON CONFLICT to work
ALTER TABLE public.admin_users DISABLE TRIGGER validate_admin_user_before_insert;

INSERT INTO public.admin_users (user_id, email, role, is_active, created_at) 
SELECT 
  au.id, 
  au.email, 
  'super_admin', 
  true, 
  NOW()
FROM auth.users au 
WHERE au.email = 'admin@alexkm.com'  -- Replace with actual admin email
ON CONFLICT (user_id) DO NOTHING;

-- Re-enable trigger
ALTER TABLE public.admin_users ENABLE TRIGGER validate_admin_user_before_insert;

-- Update the comment on admin_users table
COMMENT ON TABLE public.admin_users IS 'Admin users table - users must exist in auth.users before being granted admin access';