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
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { LogOut, Settings, User } from "lucide-react"
import Link from "next/link"

export function UserProfile() {
  const { user, signOut, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-12" />
        </div>
      </div>
    )
  }

  const userName = typeof user.name === "string" ? user.name : undefined
  const userEmail = typeof user.email === "string" ? user.email : undefined

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
              <AvatarImage
                src={typeof user.pictureUrl === "string" ? user.pictureUrl : undefined}
                alt={userName || "User"}
              />
              <AvatarFallback className="bg-mauve-accent text-mauve-bright">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-white">
                {userName || userEmail || "Anonymous"}
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
