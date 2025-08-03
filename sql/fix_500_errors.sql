-- Emergency fix for 500 errors - ensure public access works
-- Run this if the debug query shows missing policies or RLS issues

-- First, ensure RLS is enabled but not blocking public access
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Links are publicly readable" ON public.links;
DROP POLICY IF EXISTS "Profile settings are publicly readable" ON public.profile_settings;
DROP POLICY IF EXISTS "Admin users can insert links" ON public.links;
DROP POLICY IF EXISTS "Admin users can update links" ON public.links;
DROP POLICY IF EXISTS "Admin users can delete links" ON public.links;
DROP POLICY IF EXISTS "Admin users can insert profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "Admin users can update profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "Admin users can delete profile settings" ON public.profile_settings;
DROP POLICY IF EXISTS "Admin users can manage links" ON public.links;
DROP POLICY IF EXISTS "Admin users can manage profile" ON public.profile_settings;
DROP POLICY IF EXISTS "Authenticated users can manage links" ON public.links;
DROP POLICY IF EXISTS "Authenticated users can manage profile" ON public.profile_settings;

-- Create the essential public read policies first
CREATE POLICY "Public can read active links" 
ON public.links FOR SELECT 
USING (is_active = true);

CREATE POLICY "Public can read profile settings" 
ON public.profile_settings FOR SELECT 
USING (true);

-- Only add admin policies if admin_users table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
        -- Create admin write policies
        EXECUTE 'CREATE POLICY "Admin users can insert links" 
        ON public.links FOR INSERT 
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
          )
        )';

        EXECUTE 'CREATE POLICY "Admin users can update links" 
        ON public.links FOR UPDATE 
        USING (
          EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
          )
        )';

        EXECUTE 'CREATE POLICY "Admin users can delete links" 
        ON public.links FOR DELETE 
        USING (
          EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
          )
        )';

        EXECUTE 'CREATE POLICY "Admin users can insert profile settings" 
        ON public.profile_settings FOR INSERT 
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
          )
        )';

        EXECUTE 'CREATE POLICY "Admin users can update profile settings" 
        ON public.profile_settings FOR UPDATE 
        USING (
          EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
          )
        )';

        EXECUTE 'CREATE POLICY "Admin users can delete profile settings" 
        ON public.profile_settings FOR DELETE 
        USING (
          EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
          )
        )';
    ELSE
        -- Fallback to authenticated user policies if admin_users doesn't exist
        EXECUTE 'CREATE POLICY "Authenticated users can manage links" 
        ON public.links FOR ALL 
        USING (auth.role() = ''authenticated'')';

        EXECUTE 'CREATE POLICY "Authenticated users can manage profile" 
        ON public.profile_settings FOR ALL 
        USING (auth.role() = ''authenticated'')';
    END IF;
END $$;