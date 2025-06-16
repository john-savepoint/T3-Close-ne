"use client";

import { useConvexAuth } from "convex/react";
import { SignIn } from "./sign-in";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  
  if (isLoading) {
    // Loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Not authenticated
    return (
      <div className="flex items-center justify-center min-h-screen">
        {fallback || <SignIn />}
      </div>
    );
  }
  
  // Authenticated
  return <>{children}</>;
}