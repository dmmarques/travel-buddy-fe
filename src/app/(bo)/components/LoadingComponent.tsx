import { Earth } from "lucide-react";
import React from "react";

interface TripsLoadingProps {
  message?: string;
  className?: string;
}

export function LoadingComponent({
  message = "Loading your trips...",
  className = "",
}: TripsLoadingProps) {
  return (
    <>
      <Earth
        className={`w-8 h-8 animate-spin-slow text-muted-foreground mb-4 ${className}`}
      />
      <span className="text-muted-foreground text-sm">{message}</span>
    </>
  );
}
