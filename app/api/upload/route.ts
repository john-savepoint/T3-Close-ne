import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { validateFile, sanitizeFilename } from "@/lib/file-validation"

export async function POST(request: NextRequest) {
  try {
    // Check authentication with detailed error response
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ 
        error: "Authentication required",
        message: "Please sign in to upload files",
        code: "AUTH_REQUIRED"
      }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // For development, we'll just return mock data
    // In production, this would integrate with Convex file storage
    const sanitizedFilename = sanitizeFilename(file.name)
    const mockStorageId = `storage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const fileData = {
      id: `file-${Date.now()}`,
      storageId: mockStorageId,
      filename: sanitizedFilename,
      originalFilename: file.name,
      contentType: file.type,
      size: file.size,
      category: validation.category || "unknown",
      uploadedAt: Date.now(),
      status: "ready" as const,
      // Mock URL for development
      url: `/api/files/${mockStorageId}`,
    }

    return NextResponse.json({
      success: true,
      file: fileData,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "File upload endpoint",
    supportedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/json",
      "text/csv",
    ],
    maxSize: "10MB",
  })
}
