"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/use-tools"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Send, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function SummarizerPage() {
  const router = useRouter()
  const { generatePrompt } = useTools()
  const [content, setContent] = useState("")
  const [length, setLength] = useState<"short" | "medium" | "detailed">("medium")
  const [format, setFormat] = useState<"paragraph" | "bullet-points">("paragraph")
  const [isGenerating, setIsGenerating] = useState(false)
  const [summary, setSummary] = useState("")

  const handleGenerate = async () => {
    if (!content) return

    setIsGenerating(true)

    try {
      // In a real implementation, this would call your AI service
      const prompt = generatePrompt("summarizer", {
        content,
        length,
        format,
      })

      console.log("Generated prompt:", prompt)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Sample response based on format
      if (format === "paragraph") {
        setSummary(
          `The text discusses the importance of artificial intelligence in modern business operations. It highlights how AI technologies are transforming various sectors by automating routine tasks, providing data-driven insights, and enabling personalized customer experiences. The author emphasizes that companies implementing AI solutions are seeing significant improvements in efficiency, cost reduction, and competitive advantage. However, challenges remain, including data privacy concerns, the need for specialized talent, and potential workforce disruption. The conclusion suggests that businesses should develop strategic AI implementation plans that balance innovation with ethical considerations and proper staff training to maximize benefits while minimizing risks.`,
        )
      } else {
        setSummary(`• AI is transforming modern businesses across multiple sectors
• Key benefits include automation of routine tasks, data-driven insights, and personalized customer experiences
• Companies implementing AI solutions report improved efficiency, reduced costs, and competitive advantages
• Major challenges include:
  - Data privacy and security concerns
  - Shortage of specialized AI talent
  - Potential workforce disruption
• Recommendation: Develop strategic AI implementation plans that balance innovation with ethics
• Proper staff training is essential to maximize benefits while minimizing risks`)
      }
    } catch (error) {
      console.error("Error generating summary:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContinueInChat = () => {
    // In a real implementation, this would create a new chat with the context
    router.push(`/chat/new`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <FileText className="h-8 w-8" />
          <span>Summarizer</span>
        </h1>
        <p className="text-mauve-subtle/70">Condense long content into concise, easy-to-digest summaries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <label className="block text-sm font-medium mb-2">Content to Summarize</label>
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
                  <h3 className="text-sm font-medium mb-3">Summary Length</h3>
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
                  <h3 className="text-sm font-medium mb-3">Format</h3>
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

                <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || !content}>
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
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <h3 className="font-medium mb-4">Summary</h3>

              {!summary ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-mauve-subtle/20 rounded-lg p-8">
                  <div className="text-center text-mauve-subtle/50">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated summary will appear here</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 border border-mauve-subtle/20 rounded-lg p-4 mb-4 whitespace-pre-wrap overflow-auto">
                    {summary}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(summary)}>
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
