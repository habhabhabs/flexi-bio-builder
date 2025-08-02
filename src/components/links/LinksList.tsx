import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LinkButton } from './LinkButton';
import { Link } from '@/types/database';

export function LinksList() {
  const { data: links, isLoading } = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data as Link[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 w-full max-w-md">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-white/10 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!links?.length) {
    return (
      <div className="text-center text-muted-foreground">
        <p>No active links found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full max-w-md">
      {links.map((link, index) => (
        <div
          key={link.id}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <LinkButton link={link} />
        </div>
      ))}
    </div>
  );
}