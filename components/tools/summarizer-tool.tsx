"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Copy, Check } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SummarizerToolProps {
  onComplete: (result: { content: string }) => void
}

export function SummarizerTool({ onComplete }: SummarizerToolProps) {
  const [text, setText] = useState("")
  const [summaryLength, setSummaryLength] = useState("medium")
  const [summaryStyle, setSummaryStyle] = useState("paragraph")
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const handleSummarize = async () => {
    if (!text) return

    setIsLoading(true)

    try {
      // In a real application, this would make an API call
      // For this example, we'll simulate a response after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock summary based on selected options
      let summaryText = ""

      if (summaryStyle === "paragraph") {
        if (summaryLength === "short") {
          summaryText =
            "Artificial intelligence is transforming industries through automation, data analysis, and predictive capabilities. Organizations are adopting AI to gain competitive advantages, despite implementation challenges and ethical concerns."
        } else if (summaryLength === "medium") {
          summaryText =
            "Artificial intelligence is rapidly transforming multiple industries by automating routine tasks, analyzing vast datasets, and making predictive recommendations. Organizations worldwide are adopting AI technologies to enhance efficiency and gain competitive advantages. However, successful implementation requires addressing challenges like data quality, skilled personnel shortages, and integration with legacy systems. Additionally, ethical considerations regarding bias, privacy, and job displacement must be carefully managed to ensure responsible AI deployment."
        } else {
          summaryText =
            "Artificial intelligence is rapidly transforming multiple industries through its capabilities in automation, data analysis, and predictive intelligence. Manufacturing companies are using AI to optimize production lines and predict maintenance needs, while healthcare organizations deploy it for improved diagnostics and personalized treatment plans. Financial institutions leverage AI for fraud detection and algorithmic trading, and retail businesses enhance customer experiences through recommendation systems.\n\nOrganizations worldwide are adopting AI technologies to enhance operational efficiency, reduce costs, and gain competitive advantages. However, successful implementation requires addressing several challenges, including data quality issues, shortages of AI-skilled personnel, and integration difficulties with legacy systems. Many companies struggle with defining clear AI strategies and measuring return on investment.\n\nEthical considerations also play a crucial role in AI adoption, with concerns about algorithmic bias, data privacy, transparency, and potential workforce displacement requiring thoughtful governance frameworks. Despite these challenges, the transformative potential of AI continues to drive innovation across sectors, with advancements in natural language processing, computer vision, and reinforcement learning opening new possibilities for business and society."
        }
      } else {
        if (summaryLength === "short") {
          summaryText =
            "• AI is transforming industries through automation and analysis\n• Organizations adopt AI for competitive advantages\n• Implementation faces technical and ethical challenges"
        } else if (summaryLength === "medium") {
          summaryText =
            "• AI is transforming industries through automation, data analysis, and prediction\n• Manufacturing uses AI for production optimization and maintenance prediction\n• Healthcare deploys AI for improved diagnostics and treatment plans\n• Financial sector leverages AI for fraud detection and trading\n• Implementation challenges include data quality and skilled personnel shortages\n• Ethical concerns involve algorithmic bias, privacy, and job displacement"
        } else {
          summaryText =
            "• AI is transforming industries through automation, data analysis, and prediction\n• Manufacturing uses AI for production optimization and maintenance prediction\n• Healthcare deploys AI for improved diagnostics and treatment plans\n• Financial sector leverages AI for fraud detection and trading\n• Retail enhances customer experiences with recommendation systems\n• Organizations adopt AI to improve efficiency and gain competitive advantages\n• Implementation challenges include data quality issues\n• Companies face shortages of AI-skilled personnel\n• Integration with legacy systems presents technical difficulties\n• Many organizations struggle with defining clear AI strategies\n• Measuring AI return on investment remains challenging\n• Ethical concerns include algorithmic bias in decision-making\n• Data privacy considerations affect consumer trust\n• Transparency in AI systems is increasingly demanded\n• Potential workforce displacement requires management strategies\n• Governance frameworks are needed for responsible AI deployment\n• Advancements continue in natural language processing\n• Computer vision capabilities are rapidly expanding\n• Reinforcement learning opens new application possibilities"
        }
      }

      setSummary(summaryText)
      setIsLoading(false)
    } catch (error) {
      console.error("Error generating summary:", error)
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
              <Select value={summaryLength} onValueChange={setSummaryLength}>
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
              <Select value={summaryStyle} onValueChange={setSummaryStyle}>
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
