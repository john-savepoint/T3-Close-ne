"use client"

import { AttachmentLibrary } from "@/components/attachment-library"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AttachmentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="text-mauve-subtle hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        </Link>
      </div>
      <AttachmentLibrary mode="view" />
    </div>
  )
}
