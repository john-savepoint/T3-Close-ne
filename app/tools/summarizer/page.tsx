"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Send, Loader2, AlertCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { generateSummary } from "@/lib/tools-api"
import { useToast } from "@/hooks/use-toast"

export default function SummarizerPage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [length, setLength] = useState<"short" | "medium" | "detailed">("medium")
  const [format, setFormat] = useState<"paragraph" | "bullet-points">("paragraph")
  const [isGenerating, setIsGenerating] = useState(false)
  const [summary, setSummary] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!content) return

    setIsGenerating(true)
    setError(null)
    setSummary("")

    try {
      const result = await generateSummary({
        content,
        length,
        format,
      })

      if (result.success && result.content) {
        setSummary(result.content)
        toast({
          title: "Summary generated successfully",
          description: `Created a ${length} ${format} summary`,
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
      setIsGenerating(false)
    }
  }

  const handleContinueInChat = () => {
    // In a real implementation, this would create a new chat with the context
    router.push(`/chat/new`)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <FileText className="h-8 w-8" />
          <span>Summarizer</span>
        </h1>
        <p className="text-mauve-subtle/70">
          Condense long content into concise, easy-to-digest summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <label className="mb-2 block text-sm font-medium">Content to Summarize</label>
              <Textarea
                placeholder="Paste the text you want to summarize here..."
                className="min-h-[300px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-medium">Summary Length</h3>
                  <RadioGroup value={length} onValueChange={(value: any) => setLength(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short">Short (1-2 sentences)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium (1 paragraph)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed">Detailed (comprehensive)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium">Format</h3>
                  <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paragraph" id="paragraph" />
                      <Label htmlFor="paragraph">Paragraph</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bullet-points" id="bullet-points" />
                      <Label htmlFor="bullet-points">Bullet Points</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating || !content}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-500/20 bg-red-500/10">
              <CardContent className="flex items-center gap-2 p-4">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="flex h-full flex-col p-6">
              <h3 className="mb-4 font-medium">Summary</h3>

              {!summary ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-mauve-subtle/20 p-8">
                  <div className="text-center text-mauve-subtle/50">
                    <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Your generated summary will appear here</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex-1 overflow-auto whitespace-pre-wrap rounded-lg border border-mauve-subtle/20 p-4">
                    {summary}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigator.clipboard.writeText(summary)}
                    >
                      Copy to Clipboard
                    </Button>
                    <Button className="flex-1" onClick={handleContinueInChat}>
                      Continue in Chat
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
