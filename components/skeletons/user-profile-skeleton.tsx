"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function UserProfileSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2">
      {/* Avatar skeleton */}
      <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
      
      {/* User info skeleton */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-20 bg-slate-700" />
        <Skeleton className="h-3 w-12 bg-slate-700" />
      </div>
    </div>
  )
}

export function UserProfileDropdownSkeleton() {
  return (
    <div className="flex items-center gap-3 p-2 animate-pulse">
      <div className="h-8 w-8 rounded-full bg-slate-700" />
      <div className="flex flex-col gap-1">
        <div className="h-4 w-20 bg-slate-700 rounded" />
        <div className="h-3 w-12 bg-slate-700 rounded" />
      </div>
    </div>
  )
}