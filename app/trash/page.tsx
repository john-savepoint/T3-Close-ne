"use client"

import { TrashView } from "@/components/trash-view"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function TrashPage() {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <div className="flex-1">
          <TrashView />
        </div>
      </div>
    </AuthGuard>
  )
}
