"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <Skeleton className="mx-auto h-6 w-32" />
          <Skeleton className="mx-auto h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Skeleton className="h-px w-full" />
            </div>
            <div className="relative flex justify-center">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
