import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProfileSettings } from '@/types/database';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';

export function ProfileEditor() {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<ProfileSettings>) => {
      if (profile?.id) {
        const { data, error } = await supabase
          .from('profile_settings')
          .update(updates)
          .eq('id', profile.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('profile_settings')
          .insert(updates)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
      setIsLoading(false);
    },
  });

  const handleBasicSave = (formData: FormData) => {
    setIsLoading(true);
    const updates = {
      display_name: formData.get('display_name') as string,
      bio: formData.get('bio') as string,
      profile_image: formData.get('profile_image') as string || null,
      theme: formData.get('theme') as string,
      background_type: formData.get('background_type') as string,
      background_value: formData.get('background_value') as string,
    };
    updateProfileMutation.mutate(updates);
  };

  const handleSeoSave = (formData: FormData) => {
    setIsLoading(true);
    const updates = {
      seo_title: formData.get('seo_title') as string || null,
      seo_description: formData.get('seo_description') as string || null,
      seo_keywords: formData.get('seo_keywords') as string || null,
      og_title: formData.get('og_title') as string || null,
      og_description: formData.get('og_description') as string || null,
      og_image: formData.get('og_image') as string || null,
      twitter_title: formData.get('twitter_title') as string || null,
      twitter_description: formData.get('twitter_description') as string || null,
      twitter_image: formData.get('twitter_image') as string || null,
      canonical_url: formData.get('canonical_url') as string || null,
      robots_directive: formData.get('robots_directive') as string,
    };
    updateProfileMutation.mutate(updates);
  };

  const handleAnalyticsSave = (formData: FormData) => {
    setIsLoading(true);
    const updates = {
      google_analytics_id: formData.get('google_analytics_id') as string || null,
      google_tag_manager_id: formData.get('google_tag_manager_id') as string || null,
      facebook_pixel_id: formData.get('facebook_pixel_id') as string || null,
      custom_head_code: formData.get('custom_head_code') as string || null,
      custom_body_code: formData.get('custom_body_code') as string || null,
    };
    updateProfileMutation.mutate(updates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Customize your profile appearance and SEO settings
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <form action={handleBasicSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  defaultValue={profile?.display_name || ''}
                  placeholder="Your name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile?.bio || ''}
                  placeholder="Tell visitors about yourself"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="profile_image">Profile Image URL</Label>
                <Input
                  id="profile_image"
                  name="profile_image"
                  type="url"
                  defaultValue={profile?.profile_image || ''}
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select name="theme" defaultValue={profile?.theme || 'modern'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="colorful">Colorful</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="background_type">Background Type</Label>
                <Select name="background_type" defaultValue={profile?.background_type || 'gradient'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select background type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="background_value">Background Value</Label>
                <Input
                  id="background_value"
                  name="background_value"
                  defaultValue={profile?.background_value || 'primary-gradient'}
                  placeholder="e.g., primary-gradient, #ff0000, or image URL"
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Basic Settings'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-4">
            <form action={handleSeoSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  name="seo_title"
                  defaultValue={profile?.seo_title || ''}
                  placeholder="Your Name - Links & Contact"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  name="seo_description"
                  defaultValue={profile?.seo_description || ''}
                  placeholder="Connect with me through all my social platforms and links"
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="seo_keywords">SEO Keywords</Label>
                <Input
                  id="seo_keywords"
                  name="seo_keywords"
                  defaultValue={profile?.seo_keywords || ''}
                  placeholder="social media, links, contact, portfolio"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="og_title">Open Graph Title</Label>
                <Input
                  id="og_title"
                  name="og_title"
                  defaultValue={profile?.og_title || ''}
                  placeholder="Title for social media sharing"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="og_description">Open Graph Description</Label>
                <Textarea
                  id="og_description"
                  name="og_description"
                  defaultValue={profile?.og_description || ''}
                  placeholder="Description for social media sharing"
                  rows={2}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="og_image">Open Graph Image</Label>
                <Input
                  id="og_image"
                  name="og_image"
                  type="url"
                  defaultValue={profile?.og_image || ''}
                  placeholder="https://example.com/share-image.jpg"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input
                  id="canonical_url"
                  name="canonical_url"
                  type="url"
                  defaultValue={profile?.canonical_url || ''}
                  placeholder="https://linktree.alexkm.com"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="robots_directive">Robots Directive</Label>
                <Select name="robots_directive" defaultValue={profile?.robots_directive || 'index,follow'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select robots directive" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index,follow">Index, Follow</SelectItem>
                    <SelectItem value="index,nofollow">Index, No Follow</SelectItem>
                    <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                    <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save SEO Settings'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <form action={handleAnalyticsSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input
                  id="google_analytics_id"
                  name="google_analytics_id"
                  defaultValue={profile?.google_analytics_id || ''}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                <Input
                  id="google_tag_manager_id"
                  name="google_tag_manager_id"
                  defaultValue={profile?.google_tag_manager_id || ''}
                  placeholder="GTM-XXXXXXX"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                <Input
                  id="facebook_pixel_id"
                  name="facebook_pixel_id"
                  defaultValue={profile?.facebook_pixel_id || ''}
                  placeholder="123456789012345"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="custom_head_code">Custom Head Code</Label>
                <Textarea
                  id="custom_head_code"
                  name="custom_head_code"
                  defaultValue={profile?.custom_head_code || ''}
                  placeholder="Custom HTML/CSS/JS code for the <head> section"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="custom_body_code">Custom Body Code</Label>
                <Textarea
                  id="custom_body_code"
                  name="custom_body_code"
                  defaultValue={profile?.custom_body_code || ''}
                  placeholder="Custom HTML/JS code for the <body> section"
                  rows={3}
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Analytics Settings'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}