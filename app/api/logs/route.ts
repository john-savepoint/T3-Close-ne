import { NextRequest, NextResponse } from "next/server"
import * as fs from "node:fs"
import * as path from "node:path"

// This route needs Node.js runtime for file system access
export const runtime = "nodejs"

export async function GET() {
  try {
    const logsDir = path.join(process.cwd(), "logs")

    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      return NextResponse.json({ logs: [], message: "No logs directory found" })
    }

    // Get all log files, sorted by creation time (newest first)
    const logFiles = fs
      .readdirSync(logsDir)
      .filter((file: string) => file.startsWith("dev-") && file.endsWith(".log"))
      .map((file: string) => ({
        name: file,
        path: path.join(logsDir, file),
        stats: fs.statSync(path.join(logsDir, file)),
      }))
      .sort((a: any, b: any) => b.stats.mtime.getTime() - a.stats.mtime.getTime())

    if (logFiles.length === 0) {
      return NextResponse.json({ logs: [], message: "No log files found" })
    }

    // Read the most recent log file
    const latestLogFile = logFiles[0]
    const logContent = fs.readFileSync(latestLogFile.path, "utf-8")

    // Split into individual log entries and filter out empty lines
    const logs = logContent
      .split("\n\n")
      .filter((log: string) => log.trim() !== "")
      .reverse() // Show newest first

    return NextResponse.json({
      logs,
      logFile: latestLogFile.name,
      totalFiles: logFiles.length,
      lastModified: latestLogFile.stats.mtime.toISOString(),
    })
  } catch (error) {
    console.error("Error reading logs:", error)
    return NextResponse.json(
      {
        error: "Failed to read logs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Also support POST to manually add logs
export async function POST(request: NextRequest) {
  try {
    const { level, message, data } = await request.json()

    // Import logger dynamically to avoid circular dependencies
    const { logger } = await import("@/lib/logger")

    // Log the message
    logger[level as keyof typeof logger](message, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding log:", error)
    return NextResponse.json({ error: "Failed to add log" }, { status: 500 })
  }
}
