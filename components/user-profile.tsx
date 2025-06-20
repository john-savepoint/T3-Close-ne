"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { UserProfileSkeleton } from "@/components/skeletons/user-profile-skeleton"
import { useAuth } from "@/hooks/use-auth"

export function UserProfile() {
  const { user: convexUser, clerkUser, isAuthenticated, isLoading, signOut } = useAuth()

  // Show skeleton loading state while authentication is in progress
  if (isLoading) {
    return <UserProfileSkeleton />
  }

  if (!isAuthenticated || !clerkUser) {
    return (
      <div className="flex flex-col gap-2 p-2">
        <Link href="/sign-in">
          <Button variant="default" className="w-full bg-mauve-accent hover:bg-mauve-accent/80">
            <User className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button
            variant="outline"
            className="w-full border-mauve-accent/50 text-mauve-accent hover:bg-mauve-accent/10"
          >
            Create Account
          </Button>
        </Link>
      </div>
    )
  }

  const userName = clerkUser.fullName || clerkUser.firstName
  const userEmail = clerkUser.primaryEmailAddress?.emailAddress

  const userInitials = userName
    ? userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : userEmail?.[0]?.toUpperCase() || "U"

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto w-full justify-start p-2">
          <div className="flex w-full items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={clerkUser.imageUrl} alt={userName || "User"} />
              <AvatarFallback className="bg-mauve-accent text-mauve-bright">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-white">
                {userName || userEmail || "User"}
              </span>
              <Badge
                variant="outline"
                className="w-fit border-mauve-accent/50 bg-mauve-accent/20 text-xs text-mauve-bright"
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
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}