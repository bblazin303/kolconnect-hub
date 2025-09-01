import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Twitter } from "lucide-react";
import { RefreshMetricsButton } from "./RefreshMetricsButton";
import { useAuth } from "@/hooks/useAuth";

export function VerificationStatus() {
  const { user } = useAuth();
  const isVerified = user?.profile?.twitter_verified;

  return (
    <Card className="glass-card border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Twitter className="h-5 w-5 text-crypto-blue" />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isVerified ? (
              <>
                <CheckCircle className="h-5 w-5 text-crypto-blue" />
                <Badge variant="default" className="bg-crypto-blue text-white">
                  Verified
                </Badge>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-warning" />
                <Badge variant="outline" className="border-warning text-warning">
                  Not Verified
                </Badge>
              </>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          {isVerified 
            ? "Your Twitter account is verified. You can access all platform features."
            : "Twitter verification is required to post jobs and apply to campaigns."
          }
        </p>
        
        <RefreshMetricsButton />
      </CardContent>
    </Card>
  );
}