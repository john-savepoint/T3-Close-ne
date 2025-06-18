"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Copy, Check, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateSummary } from "@/lib/tools-api"
import { useToast } from "@/hooks/use-toast"

interface SummarizerToolProps {
  onComplete: (result: { content: string }) => void
}

export function SummarizerTool({ onComplete }: SummarizerToolProps) {
  const [text, setText] = useState("")
  const [summaryLength, setSummaryLength] = useState<"short" | "medium" | "detailed">("medium")
  const [summaryStyle, setSummaryStyle] = useState<"paragraph" | "bullet-points">("paragraph")
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSummarize = async () => {
    if (!text) return

    setIsLoading(true)
    setError(null)
    setSummary("")

    try {
      const result = await generateSummary({
        content: text,
        length: summaryLength,
        format: summaryStyle,
      })

      if (result.success && result.content) {
        setSummary(result.content)
        toast({
          title: "Summary generated successfully",
          description: `Created a ${summaryLength} ${summaryStyle} summary`,
        })
      } else {
        setError(result.error || "Failed to generate summary")
        toast({
          title: "Generation failed",
          description: result.error || "Unable to generate summary",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleUse = () => {
    // Format the summary with context
    const styleLabel = summaryStyle === "paragraph" ? "Paragraph" : "Bullet Points"
    const lengthLabel =
      summaryLength === "short" ? "Short" : summaryLength === "medium" ? "Medium" : "Detailed"

    const contentWithContext = `**${lengthLabel} Summary (${styleLabel}):**\n\n${summary}`
    onComplete({ content: contentWithContext })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Text to Summarize</label>
          <Textarea
            placeholder="Paste your text here..."
            className="min-h-[250px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Length</label>
              <Select value={summaryLength} onValueChange={(value) => setSummaryLength(value as typeof summaryLength)}>
                <SelectTrigger>
                  <SelectValue placeholder="Length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Format</label>
              <Select value={summaryStyle} onValueChange={(value) => setSummaryStyle(value as typeof summaryStyle)}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraph">Paragraph</SelectItem>
                  <SelectItem value="bullets">Bullet Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSummarize} disabled={!text || isLoading} className="mt-4 w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...
              </>
            ) : (
              "Summarize Text"
            )}
          </Button>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium">Summary</label>
            {summary && (
              <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6">
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>

          <Card className="min-h-[250px] bg-mauve-surface/30 p-4">
            {summary ? (
              <div className="whitespace-pre-line">{summary}</div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-mauve-subtle/70">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                    <p>Analyzing and summarizing...</p>
                  </div>
                ) : (
                  "Your summary will appear here"
                )}
              </div>
            )}
          </Card>

          {summary && (
            <Button onClick={handleUse} className="mt-4 w-full">
              Use This Summary
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
