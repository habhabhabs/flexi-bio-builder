-- Fix public access to links and profile_settings
-- The main website needs public read access, admins need write access

-- Drop ALL existing policies to ensure clean state
DROP POLICY IF EXISTS "Admin users can manage links" ON public.links;
DROP POLICY IF EXISTS "Admin users can manage profile" ON public.profile_settings;
DROP POLICY IF EXISTS "Links are publicly readable" ON public.links;
DROP POLICY IF EXISTS "Profile settings are publicly readable" ON public.profile_settings;

-- Restore public read access for the main website
CREATE POLICY "Links are publicly readable" 
ON public.links FOR SELECT 
USING (is_active = true);

CREATE POLICY "Profile settings are publicly readable" 
ON public.profile_settings FOR SELECT 
USING (true);

-- Create separate admin write policies
CREATE POLICY "Admin users can insert links" 
ON public.links FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin users can update links" 
ON public.links FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin users can delete links" 
ON public.links FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin users can insert profile settings" 
ON public.profile_settings FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin users can update profile settings" 
ON public.profile_settings FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin users can delete profile settings" 
ON public.profile_settings FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Keep the analytics policy as admin-only (no public access needed)
-- This should already be correct from previous migration