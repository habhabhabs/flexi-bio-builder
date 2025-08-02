import { Button } from '@/components/ui/button';
import { Link as LinkType } from '@/types/database';
import { Mail, Instagram, Smartphone, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LinkButtonProps {
  link: LinkType;
}

const getIcon = (iconValue: string) => {
  switch (iconValue) {
    case 'Mail':
      return Mail;
    case 'Instagram':
      return Instagram;
    case 'Smartphone':
      return Smartphone;
    default:
      return ExternalLink;
  }
};

const getVariant = (link: LinkType) => {
  if (link.icon_value === 'Mail') return 'email';
  if (link.icon_value === 'Instagram') return 'instagram';
  if (!link.url) return 'comingSoon';
  return 'default';
};

export function LinkButton({ link }: LinkButtonProps) {
  const Icon = getIcon(link.icon_value);
  const variant = getVariant(link);

  const handleClick = async () => {
    // Track analytics
    try {
      await supabase.from('link_analytics').insert({
        link_id: link.id,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        device_type: window.innerWidth < 768 ? 'mobile' : 'desktop'
      });

      // Update click count
      await supabase
        .from('links')
        .update({ click_count: link.click_count + 1 })
        .eq('id', link.id);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }

    // Navigate to URL
    if (link.url) {
      if (link.url.startsWith('mailto:')) {
        window.location.href = link.url;
      } else {
        window.open(link.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in-50 slide-in-from-bottom-3 duration-700 delay-300">
      <Button
        variant={variant}
        size="linkButton"
        onClick={handleClick}
        disabled={!link.url}
        className="relative group overflow-hidden"
      >
        {/* Coming Soon shimmer effect */}
        {!link.url && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        )}
        
        <Icon className="shrink-0" />
        <div className="flex flex-col items-start">
          <span className="font-semibold">{link.title}</span>
          {link.description && (
            <span className="text-sm opacity-90 font-normal">
              {link.description}
            </span>
          )}
        </div>
        
        {!link.url && (
          <span className="absolute top-2 right-2 text-xs bg-white/20 px-2 py-1 rounded-full">
            Soon
          </span>
        )}
      </Button>
    </div>
  );
}