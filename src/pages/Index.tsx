import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { LinksList } from '@/components/links/LinksList';
import { AdminButton } from '@/components/admin/AdminButton';
import { MetaTags } from '@/components/seo/MetaTags';
import { ManifestUpdater } from '@/components/seo/ManifestUpdater';
import { useProfile } from '@/hooks/useProfile';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Index = () => {
  const { data: profile } = useProfile();
  const { isAuthenticated, adminUser, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for magic link authentication and redirect to admin
  useEffect(() => {
    // Check if user came from magic link or password reset (Supabase adds these params)
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    if (accessToken && refreshToken) {
      if (type === 'magiclink') {
        console.log('Magic link detected, checking authentication...');
        
        // Small delay to allow auth state to update
        const checkAuthAndRedirect = setTimeout(() => {
          if (isAuthenticated && adminUser) {
            console.log('Authenticated admin user detected, redirecting to admin...');
            navigate('/admin', { replace: true });
          }
        }, 1000);
        
        return () => clearTimeout(checkAuthAndRedirect);
      } else if (type === 'recovery') {
        console.log('Password reset link detected, redirecting to reset password page...');
        navigate('/reset-password', { replace: true });
      }
    }
  }, [searchParams, isAuthenticated, adminUser, navigate]);

  // Apply background styling based on profile settings
  useEffect(() => {
    if (profile) {
      const body = document.body;
      
      // Reset any existing background classes
      body.className = body.className.replace(/bg-\w+-\w+/g, '');
      
      // Apply background based on profile settings
      if (profile.background_type === 'gradient') {
        if (profile.background_value === 'primary-gradient') {
          body.style.background = 'var(--gradient-background)';
          body.style.backgroundAttachment = 'fixed';
        }
      }
    }
  }, [profile]);

  return (
    <>
      <MetaTags profile={profile} />
      <ManifestUpdater profile={profile} />
      <AdminButton />
      
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/5 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-primary opacity-5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-8 w-full max-w-lg">
          <ProfileHeader profile={profile} />
          <LinksList />
          
          {/* Powered by watermark - conditionally shown */}
          {!profile?.hide_footer && (
            <div className="mt-8 text-center opacity-60">
              <p className="text-xs text-muted-foreground">
                Powered by FlexiBio Builder
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
