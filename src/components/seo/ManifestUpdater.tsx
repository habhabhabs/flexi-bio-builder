import { useEffect } from 'react';
import { ProfileSettings } from '@/types/database';

interface ManifestUpdaterProps {
  profile: ProfileSettings | null;
}

export function ManifestUpdater({ profile }: ManifestUpdaterProps) {
  useEffect(() => {
    if (!profile) return;

    // Only update manifest if hiding FlexiBio references
    if (profile.hide_footer) {
      const baseUrl = window.location.origin;
      
      const manifestData = {
        name: `${profile.display_name} - Personal Links` || 'Personal Links',
        short_name: profile.display_name || 'Personal Links',
        description: profile.bio || 'Personal links and contact information',
        start_url: `${baseUrl}/`,
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#6366f1',
        orientation: 'portrait-primary',
        categories: ['productivity', 'social', 'utilities'],
        icons: [
          {
            src: `${baseUrl}/favicon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: `${baseUrl}/apple-touch-icon.svg`,
            sizes: '180x180', 
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: `${baseUrl}/favicon.ico`,
            sizes: '16x16 32x32 48x48',
            type: 'image/x-icon'
          }
        ]
      };

      // Create a new manifest blob and update the link
      const manifestBlob = new Blob([JSON.stringify(manifestData, null, 2)], {
        type: 'application/json'
      });
      const manifestUrl = URL.createObjectURL(manifestBlob);

      // Update manifest link
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.setAttribute('href', manifestUrl);
      }
    }
  }, [profile]);

  return null;
}