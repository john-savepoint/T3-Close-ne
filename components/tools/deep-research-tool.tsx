"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
  ExternalLink,
  Download,
  Copy,
} from "lucide-react"
import { useResearch } from "@/hooks/use-research"
import { Id } from "@/convex/_generated/dataModel"
import { CreateResearchJobRequest } from "@/types/research"

interface DeepResearchToolProps {
  onComplete: (result: any) => void
}

export function DeepResearchTool({ onComplete }: DeepResearchToolProps) {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [activeJobId, setActiveJobId] = useState<Id<"researchJobs"> | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const {
    createResearchJob,
    useResearchJob,
    useResearchJobs,
    retryResearchJob,
    cancelResearchJob,
    deleteResearchJob,
    getJobStatusInfo,
    isJobActive,
    isJobComplete,
    canRetryJob,
    canCancelJob,
    formatDuration,
  } = useResearch()

  const activeJob = useResearchJob(activeJobId)
  const recentJobs = useResearchJobs(undefined, 10)

  const handleStartResearch = async () => {
    if (!title.trim() || !prompt.trim()) return

    setIsCreating(true)
    try {
      const request: CreateResearchJobRequest = {
        title: title.trim(),
        initialPrompt: prompt.trim(),
      }

      const jobId = await createResearchJob(request)
      setActiveJobId(jobId)

      // Clear form
      setTitle("")
      setPrompt("")
    } catch (error) {
      console.error("Failed to start research:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRetry = async (jobId: Id<"researchJobs">) => {
    await retryResearchJob(jobId)
    setActiveJobId(jobId)
  }

  const handleCancel = async (jobId: Id<"researchJobs">) => {
    await cancelResearchJob(jobId)
  }

  const handleSelectJob = (jobId: Id<"researchJobs">) => {
    setActiveJobId(jobId)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const downloadReport = (job: any) => {
    if (!job.finalReport) return

    const blob = new Blob([job.finalReport], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${job.title.replace(/[^a-z0-9]/gi, "_")}_research_report.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
            <Search className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Deep Research Mode</h2>
        <p className="text-muted-foreground">
          Conduct comprehensive, autonomous research on complex topics
        </p>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Research</TabsTrigger>
          <TabsTrigger value="history">Research History</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Research Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Analysis of the DePIN Sector"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="prompt">Research Question</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to research in detail. Be specific about the scope, timeframe, and type of analysis you need..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Deep research typically takes 5-15 minutes and performs extensive web searches.
                  This is a premium feature that consumes significant AI credits.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleStartResearch}
                disabled={!title.trim() || !prompt.trim() || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Starting Research...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Start Deep Research
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Active Job Display */}
          {activeJob && (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{activeJob.title}</h3>
                  <div className="flex items-center gap-2">
                    {canCancelJob(activeJob.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(activeJob._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${getJobStatusInfo(activeJob.status).color} text-white`}
                  >
                    {getJobStatusInfo(activeJob.status).label}
                  </Badge>
                  {activeJob.startedAt && (
                    <span className="text-sm text-muted-foreground">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {formatDuration(activeJob.startedAt, activeJob.completedAt)}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{activeJob.progress}%</span>
                  </div>
                  <Progress value={activeJob.progress} className="w-full" />
                  {activeJob.currentStep && (
                    <p className="text-sm text-muted-foreground">{activeJob.currentStep}</p>
                  )}
                </div>

                {activeJob.errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{activeJob.errorMessage}</AlertDescription>
                  </Alert>
                )}

                {isJobComplete(activeJob.status) && activeJob.finalReport && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Research Report</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(activeJob.finalReport!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(activeJob)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto rounded-lg border bg-muted/50 p-4">
                      <pre className="whitespace-pre-wrap text-sm">{activeJob.finalReport}</pre>
                    </div>

                    {activeJob.sourceUrls && activeJob.sourceUrls.length > 0 && (
                      <div>
                        <h5 className="mb-2 font-medium">
                          Sources ({activeJob.sourceUrls.length})
                        </h5>
                        <div className="max-h-32 space-y-1 overflow-y-auto">
                          {activeJob.sourceUrls.map((url: string, index: number) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() =>
                        onComplete({
                          type: "research-report",
                          title: activeJob.title,
                          content: activeJob.finalReport,
                          sources: activeJob.sourceUrls,
                        })
                      }
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Add Report to Chat
                    </Button>
                  </div>
                )}

                {canRetryJob(activeJob.status) && (
                  <Button
                    variant="outline"
                    onClick={() => handleRetry(activeJob._id)}
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Research
                  </Button>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {recentJobs && recentJobs.length > 0 ? (
            <div className="space-y-3">
              {recentJobs.map((job: any) => (
                <Card
                  key={job._id}
                  className={`cursor-pointer p-4 transition-colors hover:bg-muted/50 ${
                    activeJobId === job._id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectJob(job._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {job.initialPrompt}
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <Badge
                        variant="secondary"
                        className={`${getJobStatusInfo(job.status).color} text-xs text-white`}
                      >
                        {getJobStatusInfo(job.status).label}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 font-medium">No Research History</h3>
              <p className="text-sm text-muted-foreground">
                Your completed research reports will appear here
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
