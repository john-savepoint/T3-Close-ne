"use client"

import { AttachmentLibrary } from "@/components/attachment-library"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function AttachmentsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <AttachmentLibrary mode="view" />
      </div>
    </AuthGuard>
  )
}
