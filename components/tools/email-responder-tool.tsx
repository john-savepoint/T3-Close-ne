"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface EmailResponderToolProps {
  onComplete: (result: { content: string }) => void
}

export function EmailResponderTool({ onComplete }: EmailResponderToolProps) {
  const [emailHistory, setEmailHistory] = useState("")
  const [instructions, setInstructions] = useState("")
  const [tone, setTone] = useState<string>("professional")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!emailHistory || !instructions) return

    setIsLoading(true)

    try {
      // In a real application, this would make an API call
      // For this example, we'll simulate a response after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock response content
      const responseContent = `
Dear Team,

Thank you for the detailed overview of the project timeline. After reviewing the schedule, I can confirm that we'll be able to meet the proposed deadline of October 15th. Our development team has already begun preliminary work on the most critical components.

Regarding your question about additional resources, we don't anticipate needing any at this stage. However, we would appreciate the opportunity to review the design specifications once more before finalizing our approach.

I've scheduled a follow-up meeting for next Tuesday at 2 PM to discuss any outstanding questions. Please let me know if this works for your team.

Best regards,
[Your Name]
      `.trim()

      onComplete({ content: responseContent })
    } catch (error) {
      console.error("Error generating email:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toneOptions = [
    { value: "professional", label: "Professional" },
    { value: "formal", label: "Formal" },
    { value: "friendly", label: "Friendly" },
    { value: "casual", label: "Casual" },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Email History</label>
          <Textarea
            placeholder="Paste the previous email thread or context here..."
            className="min-h-[200px]"
            value={emailHistory}
            onChange={(e) => setEmailHistory(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Your Instructions</label>
          <Textarea
            placeholder="Explain what you want to say in your response..."
            className="min-h-[200px]"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium">Tone</label>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={tone === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTone(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleGenerate} disabled={!emailHistory || !instructions || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            "Generate Email Response"
          )}
        </Button>
      </div>
    </div>
  )
}
