import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function PostJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectProfile, setProjectProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post a job.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (user) {
      checkUserAccess();
    }
  }, [user, loading, navigate, toast]);

  const checkUserAccess = async () => {
    try {
      // First check if user is a project type
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user!.id)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        toast({
          title: "Error",
          description: "Failed to verify user permissions.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      if (userData?.user_type !== 'project') {
        toast({
          title: "Access denied",
          description: "Only project accounts can post jobs.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Fetch project profile
      const { data: profile, error: profileError } = await supabase
        .from('project_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (profileError) {
        console.error('Error fetching project profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load company profile.",
          variant: "destructive"
        });
      } else {
        setProjectProfile(profile);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from('campaigns').insert({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        budget_min: parseInt(formData.get('budget-min') as string),
        budget_max: parseInt(formData.get('budget-max') as string),
        requirements: (formData.get('requirements') as string).split('\n').filter(req => req.trim()),
        application_deadline: formData.get('deadline') as string,
        project_id: user!.id,
        status: 'active'
      });

      if (error) {
        toast({
          title: "Error posting job",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Job Posted Successfully!",
        description: "Your job has been posted to the job board.",
      });
      navigate('/jobs');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (!projectProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't find your project profile. Please contact support.
              </p>
              <Button onClick={() => navigate('/')}>
                Go Back Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/jobs')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Post a New Job</CardTitle>
                  <CardDescription>
                    Create a job posting to find the perfect KOL for your campaign
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Social Media Campaign Manager"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={projectProfile.company_name}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Company name is automatically filled from your account
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    className="min-h-32"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social-media">Social Media Marketing</SelectItem>
                        <SelectItem value="content-creation">Content Creation</SelectItem>
                        <SelectItem value="influencer-marketing">Influencer Marketing</SelectItem>
                        <SelectItem value="brand-partnership">Brand Partnership</SelectItem>
                        <SelectItem value="community-management">Community Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget-min">Minimum Budget ($)</Label>
                    <Input
                      id="budget-min"
                      type="number"
                      placeholder="1000"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget-max">Maximum Budget ($)</Label>
                    <Input
                      id="budget-max"
                      type="number"
                      placeholder="5000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List key requirements and qualifications..."
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/jobs')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Posting..." : "Post Job"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}