import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { VerificationAlert } from '@/components/ui/verification-alert';
import { Briefcase, Send } from 'lucide-react';

interface JobApplicationFormProps {
  campaignId: string;
  campaignTitle: string;
  onSuccess?: () => void;
}

export function JobApplicationForm({ campaignId, campaignTitle, onSuccess }: JobApplicationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(user?.profile?.twitter_verified || false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for jobs.",
        variant: "destructive"
      });
      return;
    }

    if (!isVerified) {
      toast({
        title: "Verification required",
        description: "You must have a verified Twitter account to apply for jobs.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from('campaign_applications').insert({
        campaign_id: campaignId,
        kol_id: user.id,
        proposed_rate: parseFloat(formData.get('proposed_rate') as string),
        cover_letter: formData.get('cover_letter') as string,
        deliverables: (formData.get('deliverables') as string).split('\n').filter(item => item.trim()),
        status: 'pending'
      });

      if (error) {
        toast({
          title: "Application failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the project team.",
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Apply for this Job</CardTitle>
            <CardDescription>
              Submit your application for "{campaignTitle}"
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!isVerified && (
          <div className="mb-6">
            <VerificationAlert 
              userType="kol" 
              action="apply for jobs" 
              showRefreshButton={true}
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="proposed_rate">Proposed Rate (USD per hour)</Label>
            <Input
              id="proposed_rate"
              name="proposed_rate"
              type="number"
              placeholder="50"
              min="1"
              step="0.01"
              required
              disabled={!isVerified}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter</Label>
            <Textarea
              id="cover_letter"
              name="cover_letter"
              placeholder="Tell them why you're the perfect fit for this campaign..."
              className="min-h-32"
              required
              disabled={!isVerified}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverables">Proposed Deliverables</Label>
            <Textarea
              id="deliverables"
              name="deliverables"
              placeholder="List what you'll deliver (one per line)..."
              className="min-h-24"
              disabled={!isVerified}
            />
            <p className="text-xs text-muted-foreground">
              Enter each deliverable on a new line
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !isVerified}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}