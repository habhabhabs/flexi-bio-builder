import { useEffect } from 'react';
import { ProfileSettings } from '@/types/database';

interface MetaTagsProps {
  profile: ProfileSettings | null;
}

export function MetaTags({ profile }: MetaTagsProps) {
  useEffect(() => {
    if (!profile) return;

    // Update document title
    document.title = profile.seo_title || `${profile.display_name} - Links`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', profile.seo_description || profile.bio || '');
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && profile.seo_keywords) {
      metaKeywords.setAttribute('content', profile.seo_keywords);
    } else if (!metaKeywords && profile.seo_keywords) {
      const keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      keywordsMeta.content = profile.seo_keywords;
      document.head.appendChild(keywordsMeta);
    }

    // Update robots directive
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', profile.robots_directive);
    } else {
      const robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      robotsMeta.content = profile.robots_directive;
      document.head.appendChild(robotsMeta);
    }

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink && profile.canonical_url) {
      canonicalLink.setAttribute('href', profile.canonical_url);
    } else if (!canonicalLink && profile.canonical_url) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = profile.canonical_url;
      document.head.appendChild(canonical);
    }

    // Open Graph tags
    const updateOrCreateOGTag = (property: string, content: string) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', content);
      } else {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        ogTag.setAttribute('content', content);
        document.head.appendChild(ogTag);
      }
    };

    if (profile.og_title) updateOrCreateOGTag('og:title', profile.og_title);
    if (profile.og_description) updateOrCreateOGTag('og:description', profile.og_description);
    if (profile.og_image) updateOrCreateOGTag('og:image', profile.og_image);
    updateOrCreateOGTag('og:type', 'website');

    // Twitter Card tags
    const updateOrCreateTwitterTag = (name: string, content: string) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (twitterTag) {
        twitterTag.setAttribute('content', content);
      } else {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', name);
        twitterTag.setAttribute('content', content);
        document.head.appendChild(twitterTag);
      }
    };

    updateOrCreateTwitterTag('twitter:card', profile.twitter_card_type);
    if (profile.twitter_title) updateOrCreateTwitterTag('twitter:title', profile.twitter_title);
    if (profile.twitter_description) updateOrCreateTwitterTag('twitter:description', profile.twitter_description);
    if (profile.twitter_image) updateOrCreateTwitterTag('twitter:image', profile.twitter_image);

    // Custom head code injection
    if (profile.custom_head_code) {
      const customHeadDiv = document.createElement('div');
      customHeadDiv.innerHTML = profile.custom_head_code;
      document.head.appendChild(customHeadDiv);
    }

  }, [profile]);

  return null; // This component only manages head tags
}