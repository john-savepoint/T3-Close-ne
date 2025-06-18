"use client"

import { ArchiveView } from "@/components/archive-view"

export default function ArchivePage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1">
        <ArchiveView />
      </div>
    </div>
  )
}
