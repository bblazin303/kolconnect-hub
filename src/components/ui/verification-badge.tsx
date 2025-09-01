import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerificationBadge({ isVerified, size = "md", className }: VerificationBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <CheckCircle 
      className={cn(
        "text-crypto-blue", 
        sizeClasses[size],
        className
      )} 
    />
  );
}