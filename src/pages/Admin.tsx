import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, ArrowLeft, BarChart3, Settings, Users, LinkIcon, LogOut } from 'lucide-react';
import { LinkEditor } from '@/components/admin/LinkEditor';
import { ProfileEditor } from '@/components/admin/ProfileEditor';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminUserManagement } from '@/components/admin/AdminUserManagement';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function Admin() {
  const { user, adminUser, isAuthenticated, loading, signOut } = useAdminAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('title, click_count');
      
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </span>
              {adminUser && (
                <div className="text-xs text-muted-foreground">
                  Role: {adminUser.role.replace('_', ' ')}
                </div>
              )}
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">
                    {analytics?.reduce((sum, link) => sum + link.click_count, 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Link className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Links</p>
                  <p className="text-2xl font-bold">{analytics?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-coming-soon/10 rounded-lg">
                  <Users className="w-6 h-6 text-coming-soon" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile Views</p>
                  <p className="text-2xl font-bold">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="links" className="w-full">
          <TabsList className={`grid w-full ${adminUser && ['super_admin', 'admin'].includes(adminUser.role) ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="links">
              <LinkIcon className="w-4 h-4 mr-2" />
              Links
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            {adminUser && ['super_admin', 'admin'].includes(adminUser.role) && (
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="links" className="mt-6">
            <LinkEditor />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <ProfileEditor />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Link Performance</CardTitle>
                <CardDescription>
                  Click statistics and analytics for your links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{link.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {link.click_count} total clicks
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{link.click_count}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                    </div>
                  ))}
                  
                  {!analytics?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>No analytics data yet. Add some links to start tracking clicks!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {adminUser && ['super_admin', 'admin'].includes(adminUser.role) && (
            <TabsContent value="users" className="mt-6">
              <AdminUserManagement />
            </TabsContent>
          )}
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center text-muted-foreground">
          <p className="text-sm">
            Admin Panel - Built with Supabase & React
          </p>
        </div>
      </div>
    </div>
  );
}