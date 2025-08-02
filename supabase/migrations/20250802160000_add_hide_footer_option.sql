-- Add hide_footer option to profile_settings table
ALTER TABLE public.profile_settings 
ADD COLUMN hide_footer BOOLEAN DEFAULT false;

-- Update the column with a comment for clarity
COMMENT ON COLUMN public.profile_settings.hide_footer IS 'Hide the "Powered by FlexiBio Builder" footer when set to true';