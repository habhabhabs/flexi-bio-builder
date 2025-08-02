# Supabase Setup Guide

This guide walks you through setting up Supabase for the FlexiBio Builder application.

## Prerequisites

- A Supabase account (free tier is sufficient for getting started)
- Basic understanding of SQL and database concepts

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: `flexi-bio-builder` (or your preferred name)
   - **Database Password**: Generate a secure password and save it
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier is fine for development

4. Click "Create new project"
5. Wait for the project to be fully provisioned (usually 2-3 minutes)

## Step 2: Configure Database Schema

1. Navigate to the **SQL Editor** in your Supabase dashboard
2. Copy and paste the following SQL schema to create all necessary tables:

```sql
-- Create links table for link management
CREATE TABLE public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  url VARCHAR(500),
  icon_type VARCHAR(50) DEFAULT 'default', -- 'default', 'custom', 'emoji'
  icon_value VARCHAR(100), -- icon name, custom URL, or emoji
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  position INTEGER NOT NULL,
  style_override JSONB, -- Custom styling per link
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile settings table
CREATE TABLE public.profile_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name VARCHAR(100),
  bio TEXT,
  profile_image VARCHAR(500),
  background_type VARCHAR(20) DEFAULT 'gradient', -- 'solid', 'gradient', 'image'
  background_value VARCHAR(500) DEFAULT 'primary-gradient',
  theme VARCHAR(20) DEFAULT 'modern',
  custom_css TEXT,
  seo_title VARCHAR(100),
  seo_description VARCHAR(200),
  seo_keywords TEXT,
  og_title VARCHAR(100),
  og_description VARCHAR(200),
  og_image VARCHAR(500),
  twitter_card_type VARCHAR(20) DEFAULT 'summary_large_image',
  twitter_title VARCHAR(100),
  twitter_description VARCHAR(200),
  twitter_image VARCHAR(500),
  google_analytics_id VARCHAR(50),
  google_tag_manager_id VARCHAR(50),
  facebook_pixel_id VARCHAR(50),
  custom_head_code TEXT,
  custom_body_code TEXT,
  robots_directive VARCHAR(100) DEFAULT 'index,follow',
  canonical_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create link analytics table
CREATE TABLE public.link_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer VARCHAR(500),
  ip_address INET,
  country VARCHAR(2),
  device_type VARCHAR(20)
);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to links and profile
CREATE POLICY "Links are publicly readable" 
ON public.links FOR SELECT 
USING (is_active = true);

CREATE POLICY "Profile settings are publicly readable" 
ON public.profile_settings FOR SELECT 
USING (true);

-- Create policies for authenticated admin access
CREATE POLICY "Authenticated users can manage links" 
ON public.links FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage profile" 
ON public.profile_settings FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view analytics" 
ON public.link_analytics FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert analytics" 
ON public.link_analytics FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON public.links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profile_settings_updated_at
    BEFORE UPDATE ON public.profile_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial profile settings
INSERT INTO public.profile_settings (
  display_name, 
  bio, 
  seo_title, 
  seo_description,
  og_title,
  og_description,
  theme,
  background_type,
  background_value
) VALUES (
  'Alex KM',
  '🚀 Digital Creator & Entrepreneur',
  'Alex KM - Links & Contact',
  'Connect with Alex KM through all social platforms and channels.',
  'Alex KM - Digital Creator',
  'Connect with Alex KM through all social platforms and channels.',
  'modern',
  'gradient',
  'primary-gradient'
);

-- Insert initial links
INSERT INTO public.links (title, url, icon_type, icon_value, description, position, is_active) VALUES
('Email Me', 'mailto:engagement@alexkm.com', 'default', 'Mail', 'Get in touch directly via email', 1, true),
('Instagram', 'https://instagram.com/alexkm', 'default', 'Instagram', 'Follow my daily adventures', 2, true),
('Lemon8', null, 'default', 'Smartphone', 'Coming Soon - New platform launch!', 3, false);

-- Enable realtime for live updates
ALTER TABLE public.links REPLICA IDENTITY FULL;
ALTER TABLE public.profile_settings REPLICA IDENTITY FULL;
ALTER TABLE public.link_analytics REPLICA IDENTITY FULL;
```

3. Click "Run" to execute the SQL
4. Verify that all tables have been created by checking the **Table Editor**

## Step 3: Get API Credentials

1. Navigate to **Settings** → **API**
2. Copy the following values (you'll need these for your `.env` file):
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Configure Authentication (Optional but Recommended)

For admin access to the management panel:

1. Navigate to **Authentication** → **Settings**
2. Configure your preferred authentication providers:
   - **Email**: Enable for email/password login
   - **Google**: Add OAuth credentials for Google login
   - **GitHub**: Add OAuth credentials for GitHub login

3. Set up email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and reset password templates

## Step 5: Set Up Environment Variables

Create a `.env` file in your project root (copy from `.env.example`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here

# Application Configuration
VITE_APP_URL=https://linktree.alexkm.com
```

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:8080`
3. Verify that:
   - The profile information displays correctly
   - Links are loaded from the database
   - Click tracking works (check the analytics table)

## Database Schema Overview

### Tables

#### `links`
- **Purpose**: Stores all link information
- **Key Fields**: `title`, `url`, `icon_value`, `is_active`, `position`, `click_count`
- **Security**: Public read for active links, authenticated write

#### `profile_settings`
- **Purpose**: Stores profile and SEO configuration
- **Key Fields**: `display_name`, `bio`, `seo_title`, `theme`, `background_type`
- **Security**: Public read, authenticated write

#### `link_analytics`
- **Purpose**: Tracks link click events
- **Key Fields**: `link_id`, `clicked_at`, `user_agent`, `device_type`
- **Security**: Public insert (for tracking), authenticated read

### Row Level Security (RLS)

The database uses RLS to ensure:
- **Public users** can view active links and profile settings
- **Public users** can insert analytics data for click tracking
- **Authenticated users** can manage all content through the admin panel
- **Authenticated users** can view analytics data

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**
   - Ensure all SQL has been executed successfully
   - Check that tables exist in the Table Editor

2. **RLS policy errors**
   - Verify that RLS is enabled on all tables
   - Check that policies are correctly configured

3. **Authentication issues**
   - Ensure your Supabase URL and keys are correct
   - Check that authentication is properly configured

4. **Real-time updates not working**
   - Verify that `REPLICA IDENTITY FULL` is set on tables
   - Check that Supabase realtime is enabled for your tables

### Useful SQL Queries

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- View RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';

-- Check table permissions
SELECT * FROM information_schema.table_privileges 
WHERE table_schema = 'public';
```

## Next Steps

After completing this setup:
1. Configure AWS S3 for deployment (see `AWS_SETUP.md`)
2. Set up GitHub Actions for CI/CD
3. Configure your custom domain
4. Add additional authentication providers if needed

## Security Best Practices

1. **Keep your service_role key secure** - Never expose it in client-side code
2. **Use environment variables** for all sensitive configuration
3. **Regularly rotate API keys** in production
4. **Monitor usage** through the Supabase dashboard
5. **Set up alerts** for unusual activity patterns

For production deployments, consider upgrading to a paid Supabase plan for better performance, support, and additional features.