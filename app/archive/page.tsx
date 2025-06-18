"use client"

import { ArchiveView } from "@/components/archive-view"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function ArchivePage() {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <div className="flex-1">
          <ArchiveView />
        </div>
      </div>
    </AuthGuard>
  )
}
