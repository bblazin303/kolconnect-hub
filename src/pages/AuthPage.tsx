import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Building2, Twitter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/layout/Header';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, isAuthenticated, signInWithTwitter } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleTwitterSignIn = async (userType: 'kol' | 'project') => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signInWithTwitter(userType);
      
      if (error) {
        console.error('Twitter sign-in error:', error);
        setError('Failed to connect with Twitter. Please try again.');
        setIsLoading(false);
      }
      // If successful, user will be redirected to Twitter, then back to callback
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join Our Platform</CardTitle>
              <CardDescription>
                Choose your account type to get started with Twitter
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">I am a...</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your account type to continue with Twitter authentication
                  </p>
                </div>

                <Button
                  onClick={() => handleTwitterSignIn('kol')}
                  disabled={isLoading}
                  className="w-full h-16 flex items-center justify-center gap-4 bg-primary hover:bg-primary/90 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <span className="font-medium">KOL / Influencer</span>
                      </div>
                      <Twitter className="h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  For content creators, influencers, and social media personalities
                </div>

                <Button
                  onClick={() => handleTwitterSignIn('project')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-16 flex items-center justify-center gap-4 border-primary hover:bg-primary/5"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        <span className="font-medium">Project / Company</span>
                      </div>
                      <Twitter className="h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  For brands, projects, and companies looking to hire KOLs
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                By continuing, you agree to connect your Twitter account and our terms of service.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}