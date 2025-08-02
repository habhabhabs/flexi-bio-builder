import { ProfileSettings } from '@/types/database';

interface ProfileHeaderProps {
  profile: ProfileSettings | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  if (!profile) return null;

  return (
    <div className="text-center space-y-4 animate-in fade-in-50 slide-in-from-bottom-3 duration-700">
      {profile.profile_image && (
        <div className="flex justify-center">
          <div className="relative">
            <img
              src={profile.profile_image}
              alt={profile.display_name || 'Profile'}
              className="w-24 h-24 rounded-full border-4 border-white/20 shadow-elegant object-cover"
            />
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-primary opacity-10"></div>
          </div>
        </div>
      )}
      
      {profile.display_name && (
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          {profile.display_name}
        </h1>
      )}
      
      {profile.bio && (
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          {profile.bio}
        </p>
      )}
    </div>
  );
}