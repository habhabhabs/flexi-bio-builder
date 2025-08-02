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
$$ LANGUAGE plpgsql;

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