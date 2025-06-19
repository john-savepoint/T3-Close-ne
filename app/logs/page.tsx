"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, RefreshCw, FileText, AlertCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [currentLogFile, setCurrentLogFile] = useState<string>("")
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    // Get session info from logger
    import("@/lib/logger").then(({ sessionInfo }) => {
      setSessionInfo(sessionInfo)
      setCurrentLogFile(sessionInfo.logFile)
    })
  }, [])

  const refreshLogs = async () => {
    try {
      const response = await fetch("/api/logs")
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    }
  }

  const copyLogs = () => {
    const logText = logs.join("\n")
    navigator.clipboard.writeText(logText)
  }

  const downloadLogs = () => {
    const logText = logs.join("\n")
    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `z6chat-logs-${new Date().toISOString().slice(0, 19)}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    refreshLogs()
    // Refresh logs every 5 seconds
    const interval = setInterval(refreshLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Development Logs</h1>
          <p className="text-sm text-gray-400">Real-time error logging for debugging</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshLogs} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={copyLogs} variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy All
          </Button>
          <Button onClick={downloadLogs} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {sessionInfo && (
        <Card className="border-slate-700 bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5" />
              Session Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Session ID</Badge>
              <span className="font-mono text-sm text-gray-300">{sessionInfo.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Started</Badge>
              <span className="text-sm text-gray-300">
                {new Date(sessionInfo.startTime).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Log File</Badge>
              <span className="break-all font-mono text-xs text-gray-400">
                {sessionInfo.logFile}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-700 bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertCircle className="h-5 w-5" />
            Live Logs ({logs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded border border-slate-700 bg-black p-4">
            {logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No logs yet</p>
                  <p className="text-xs">Interact with the app to generate logs</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {logs.map((log, index) => {
                  const isError = log.includes("ERROR")
                  const isWarn = log.includes("WARN")
                  const isInfo = log.includes("INFO")

                  return (
                    <div
                      key={index}
                      className={`rounded border-l-2 p-2 ${
                        isError
                          ? "border-red-500 bg-red-500/10 text-red-300"
                          : isWarn
                            ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
                            : isInfo
                              ? "border-blue-500 bg-blue-500/10 text-blue-300"
                              : "border-gray-500 bg-gray-500/10 text-gray-300"
                      }`}
                    >
                      <pre className="whitespace-pre-wrap break-all">{log}</pre>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        <p>
          <strong>Tip:</strong> This page auto-refreshes every 5 seconds. You can copy logs to share
          with developers or download them as a file.
        </p>
        <p className="mt-1">
          Log file location: <code className="rounded bg-slate-800 px-1">{currentLogFile}</code>
        </p>
      </div>
    </div>
  )
}
