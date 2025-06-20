import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { validateFile, sanitizeFilename } from "@/lib/file-validation"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

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
    const chatId = formData.get("chatId") as string | null
    const description = formData.get("description") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Initialize Convex client
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

    try {
      // Step 1: Generate upload URL
      const uploadUrl = await convex.mutation(api.files.generateUploadUrl, {})

      // Step 2: Upload file to Convex storage
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!uploadResult.ok) {
        throw new Error(`Storage upload failed: ${uploadResult.statusText}`)
      }

      const { storageId } = await uploadResult.json()

      // Step 3: Save file metadata
      function getFileCategory(mimeType: string): string {
        if (mimeType.startsWith("image/")) return "images"
        if (mimeType.startsWith("text/") || mimeType.includes("javascript") || mimeType.includes("typescript")) return "code"
        if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("presentation") || mimeType.includes("markdown")) return "documents"
        if (mimeType.includes("spreadsheet") || mimeType.includes("csv") || mimeType.includes("json") || mimeType.includes("xml")) return "data"
        return "other"
      }

      const sanitizedFilename = sanitizeFilename(file.name)
      const category = getFileCategory(file.type)

      const attachmentId = await convex.mutation(api.files.saveFile, {
        storageId,
        filename: sanitizedFilename,
        originalFilename: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
        category,
        chatId: chatId ? chatId as any : undefined,
        description: description || `Uploaded file: ${file.name}`,
      })

      // Step 4: Get file URL for response
      const fileUrl = await convex.query(api.files.getFileUrl, { storageId })

      const fileData = {
        id: attachmentId,
        storageId,
        filename: sanitizedFilename,
        originalFilename: file.name,
        contentType: file.type,
        size: file.size,
        category,
        uploadedAt: Date.now(),
        status: "ready" as const,
        url: fileUrl,
      }

      return NextResponse.json({
        success: true,
        file: fileData,
      })

    } catch (convexError) {
      console.error("Convex upload error:", convexError)
      return NextResponse.json({ 
        error: "Failed to save file", 
        details: convexError instanceof Error ? convexError.message : "Unknown error"
      }, { status: 500 })
    }

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
