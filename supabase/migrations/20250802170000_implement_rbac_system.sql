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

CREATE POLICY "Admins can create new admin users" 
ON public.admin_users FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin') AND is_active = true
  )
);

-- Update existing policies to use admin_users table
DROP POLICY IF EXISTS "Authenticated users can manage links" ON public.links;
DROP POLICY IF EXISTS "Authenticated users can manage profile" ON public.profile_settings;
DROP POLICY IF EXISTS "Authenticated users can view analytics" ON public.link_analytics;

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
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update last_login
CREATE OR REPLACE FUNCTION public.update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.admin_users 
  SET last_login = NOW() 
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_login on auth sign in
-- Note: This requires setting up a webhook or using Supabase Edge Functions
-- For now, we'll handle this in the application code

-- Insert initial super admin (replace with your actual admin email)
-- This should be done manually in production with the actual admin email
INSERT INTO public.admin_users (user_id, email, role, is_active, created_at) 
SELECT 
  au.id, 
  au.email, 
  'super_admin', 
  true, 
  NOW()
FROM auth.users au 
WHERE au.email = 'admin@alexkm.com'  -- Replace with actual admin email
ON CONFLICT (email) DO NOTHING;

-- Create view for admin dashboard
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
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