export interface Link {
  id: string;
  title: string;
  url: string | null;
  icon_type: string;
  icon_value: string;
  description: string | null;
  is_active: boolean;
  click_count: number;
  position: number;
  style_override: any;
  created_at: string;
  updated_at: string;
}

export interface ProfileSettings {
  id: string;
  display_name: string | null;
  bio: string | null;
  profile_image: string | null;
  background_type: string;
  background_value: string;
  theme: string;
  custom_css: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card_type: string;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  facebook_pixel_id: string | null;
  custom_head_code: string | null;
  custom_body_code: string | null;
  robots_directive: string;
  canonical_url: string | null;
  hide_footer: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkAnalytics {
  id: string;
  link_id: string;
  clicked_at: string;
  user_agent: string | null;
  referrer: string | null;
  ip_address: string | null;
  country: string | null;
  device_type: string | null;
}