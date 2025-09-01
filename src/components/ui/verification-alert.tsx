import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Twitter, RefreshCw } from "lucide-react";
import { RefreshMetricsButton } from "@/components/dashboard/RefreshMetricsButton";

interface VerificationAlertProps {
  userType: "kol" | "project";
  action: "post jobs" | "apply to jobs";
  showRefreshButton?: boolean;
}

export function VerificationAlert({ userType, action, showRefreshButton = true }: VerificationAlertProps) {
  return (
    <Alert className="border-warning bg-warning/5">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex flex-col gap-3">
        <div>
          <strong>Twitter Verification Required</strong>
          <p className="text-sm text-muted-foreground mt-1">
            You need a verified Twitter account to {action}. Please ensure your Twitter account has a blue verification badge.
          </p>
        </div>
        
        {showRefreshButton && (
          <div className="flex flex-col sm:flex-row gap-2">
            <RefreshMetricsButton />
            <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
              <a href="https://help.twitter.com/en/managing-your-account/twitter-blue-verification" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
                Learn About Verification
              </a>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}