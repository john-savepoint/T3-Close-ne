"use client";

import { SignIn } from "@/components/auth/sign-in";
import { SignUp } from "@/components/auth/sign-up";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Z6Chat</h1>
          <p className="text-muted-foreground">
            Your AI-powered conversation assistant
          </p>
        </div>
        
        {isSignIn ? <SignIn /> : <SignUp />}
        
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignIn(!isSignIn)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isSignIn 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </Button>
        </div>
      </div>
    </div>
  );
}