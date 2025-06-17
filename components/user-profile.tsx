"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

export function UserProfile() {
  const { user, signOut, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-12 h-2" />
        </div>
      </div>
    );
  }

  const userName = typeof user.name === 'string' ? user.name : undefined;
  const userEmail = typeof user.email === 'string' ? user.email : undefined;
  
  const userInitials = userName
    ? userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : userEmail?.[0]?.toUpperCase() || "U";

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start p-2 h-auto">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={typeof user.image === 'string' ? user.image : undefined} 
                alt={userName || "User"} 
              />
              <AvatarFallback className="bg-mauve-accent text-mauve-bright">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm text-white">
                {userName || userEmail || "Anonymous"}
              </span>
              <Badge
                variant="outline"
                className="w-fit text-xs bg-mauve-accent/20 border-mauve-accent/50 text-mauve-bright"
              >
                Free
              </Badge>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}