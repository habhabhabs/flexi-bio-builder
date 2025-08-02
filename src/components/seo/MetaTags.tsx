import { useEffect } from 'react';
import { ProfileSettings } from '@/types/database';

interface MetaTagsProps {
  profile: ProfileSettings | null;
}

export function MetaTags({ profile }: MetaTagsProps) {
  useEffect(() => {
    if (!profile) return;

    // Determine if FlexiBio Builder branding should be hidden
    const hideFlexiBioReferences = profile.hide_footer;

    // Update document title
    if (hideFlexiBioReferences) {
      document.title = profile.seo_title || `${profile.display_name} - Links` || 'Personal Links';
    } else {
      document.title = profile.seo_title || `${profile.display_name} - Links`;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const defaultDescription = hideFlexiBioReferences 
        ? profile.bio || 'Personal links and contact information'
        : profile.bio || 'Enhanced personal linktree application built with React + Supabase';
      metaDescription.setAttribute('content', profile.seo_description || defaultDescription);
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

    const defaultOGTitle = hideFlexiBioReferences 
      ? `${profile.display_name} - Personal Links` || 'Personal Links'
      : `${profile.display_name} - FlexiBio Builder` || 'FlexiBio Builder - Enhanced Personal Linktree';
    const defaultOGDescription = hideFlexiBioReferences
      ? profile.bio || 'Personal links and contact information'
      : profile.bio || 'Enhanced personal linktree application built with React + Supabase';

    updateOrCreateOGTag('og:title', profile.og_title || defaultOGTitle);
    updateOrCreateOGTag('og:description', profile.og_description || defaultOGDescription);
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

    const defaultTwitterTitle = hideFlexiBioReferences 
      ? `${profile.display_name} - Personal Links` || 'Personal Links'
      : `${profile.display_name} - FlexiBio Builder` || 'FlexiBio Builder - Enhanced Personal Linktree';
    const defaultTwitterDescription = hideFlexiBioReferences
      ? profile.bio || 'Personal links and contact information'
      : profile.bio || 'Enhanced personal linktree application built with React + Supabase';

    updateOrCreateTwitterTag('twitter:card', profile.twitter_card_type);
    updateOrCreateTwitterTag('twitter:title', profile.twitter_title || defaultTwitterTitle);
    updateOrCreateTwitterTag('twitter:description', profile.twitter_description || defaultTwitterDescription);
    if (profile.twitter_image) updateOrCreateTwitterTag('twitter:image', profile.twitter_image);

    // Update apple-mobile-web-app-title if hiding FlexiBio references
    const appTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (appTitleMeta && hideFlexiBioReferences) {
      appTitleMeta.setAttribute('content', profile.display_name || 'Personal Links');
    }

    // Custom head code injection
    if (profile.custom_head_code) {
      const customHeadDiv = document.createElement('div');
      customHeadDiv.innerHTML = profile.custom_head_code;
      document.head.appendChild(customHeadDiv);
    }

  }, [profile]);

  return null; // This component only manages head tags
}