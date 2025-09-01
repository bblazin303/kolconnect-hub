import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Twitter, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface VerificationAlertProps {
  userType: 'kol' | 'project';
  action: string;
  showRefreshButton?: boolean;
  className?: string;
}

export function VerificationAlert({ userType, action, showRefreshButton = true, className }: VerificationAlertProps) {
  const isKOL = userType === 'kol';
  const dashboardPath = `/dashboard/${isKOL ? 'kol' : 'project'}`;

  return (
    <Alert className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium mb-1">Twitter Verification Required</p>
          <p className="text-sm text-muted-foreground">
            You need a verified Twitter account to {action}. If you recently got verified, refresh your Twitter metrics.
          </p>
        </div>
        {showRefreshButton && (
          <div className="flex gap-2 ml-4">
            <Link to={dashboardPath}>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-3 w-3" />
                Refresh Metrics
              </Button>
            </Link>
            <Link to="https://help.twitter.com/en/managing-your-account/about-twitter-verified-accounts" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <Twitter className="h-3 w-3" />
                Get Verified
              </Button>
            </Link>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}