import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const isConfigError = this.state.error.message.includes('Missing VITE_SUPABASE');
      
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <CardTitle className="text-2xl">
                {isConfigError ? 'Configuration Required' : 'Application Error'}
              </CardTitle>
              <CardDescription>
                {isConfigError 
                  ? 'The application needs to be configured before it can run.'
                  : 'Something went wrong while loading the application.'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isConfigError ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-2">Missing Environment Variables</h3>
                    <p className="text-amber-700 text-sm mb-3">
                      This application requires Supabase configuration to function properly.
                    </p>
                    <div className="text-xs text-amber-600 bg-amber-100 p-2 rounded font-mono">
                      {this.state.error.message}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Quick Fix:</h4>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>
                        Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to{' '}
                        <code className="bg-gray-100 px-1 rounded">.env</code>
                      </li>
                      <li>
                        Get your Supabase credentials from:{' '}
                        <Button 
                          variant="link" 
                          className="h-auto p-0 text-blue-600"
                          onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                        >
                          Supabase Dashboard → Settings → API
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </li>
                      <li>Update the <code className="bg-gray-100 px-1 rounded">.env</code> file with your values</li>
                      <li>Restart the development server</li>
                    </ol>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      📚 Need help? Check the{' '}
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-blue-600"
                        onClick={() => window.open('/docs/SUPABASE_SETUP.md', '_blank')}
                      >
                        Supabase Setup Guide
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
                    <div className="text-xs text-red-600 bg-red-100 p-2 rounded font-mono">
                      {this.state.error.message}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Troubleshooting Steps:</h4>
                    <ol className="text-sm space-y-2 list-decimal list-inside">
                      <li>Check the browser console for additional error details</li>
                      <li>Verify all environment variables are properly set</li>
                      <li>Ensure Supabase service is accessible</li>
                      <li>Try refreshing the page</li>
                    </ol>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => console.clear()}
                >
                  Clear Console
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;