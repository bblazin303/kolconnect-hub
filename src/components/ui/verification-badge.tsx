import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function VerificationBadge({ 
  isVerified, 
  size = "md", 
  showText = false,
  className 
}: VerificationBadgeProps) {
  if (!isVerified) return null;

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  if (showText) {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "bg-crypto-blue/10 text-crypto-blue border-crypto-blue/30 font-medium",
          className
        )}
      >
        <CheckCircle className={cn("mr-1", iconSizes[size])} />
        Verified
      </Badge>
    );
  }

  return (
    <CheckCircle 
      className={cn(
        "text-crypto-blue", 
        iconSizes[size],
        className
      )} 
    />
  );
}