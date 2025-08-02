import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Key, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export function AdminLogin() {
  const { signInWithEmail, signInWithMagicLink, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else {
      toast.success('Successfully signed in!');
    }
    
    setIsLoading(false);
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const { error } = await signInWithMagicLink(email);
    
    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else {
      setMessage('Check your email for the login link!');
      toast.success('Magic link sent to your email!');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Sign in to access the FlexiBio Builder admin panel
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="magic-link" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="magic-link" className="space-y-4">
              <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-magic">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-magic"
                      type="email"
                      placeholder="admin@alexkm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading || loading}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || loading}
                >
                  {isLoading || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Magic Link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  A secure login link will be sent to your email
                </p>
              </form>
            </TabsContent>
            
            <TabsContent value="password" className="space-y-4">
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-password">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-password"
                      type="email"
                      placeholder="admin@alexkm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading || loading}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading || loading}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || loading}
                >
                  {isLoading || loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Don't have admin access?
              </p>
              <p className="text-xs text-muted-foreground">
                Contact the site administrator to get access credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}