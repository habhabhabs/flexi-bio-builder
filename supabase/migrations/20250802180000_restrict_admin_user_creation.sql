-- Update admin_users table to require existing auth.users
-- Remove the ability to create admin_users without corresponding auth.users

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can create new admin users" ON public.admin_users;

-- Create new policy that requires existing auth user
CREATE POLICY "Admins can create admin users for existing auth users" 
ON public.admin_users FOR INSERT 
WITH CHECK (
  -- User must be an admin or super admin
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin') AND is_active = true
  )
  AND
  -- The user_id being inserted must exist in auth.users
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id
  )
  AND
  -- The email must match the auth.users email
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id AND email = NEW.email
  )
);

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

-- Create RLS policy for the function (only admins can see available users)
CREATE POLICY "Only admins can view available auth users"
ON public.admin_users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin') AND is_active = true
  )
);

-- Update the comment on admin_users table
COMMENT ON TABLE public.admin_users IS 'Admin users table - users must exist in auth.users before being granted admin access';