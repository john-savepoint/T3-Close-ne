"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle } from "lucide-react"
import { generateEmailResponse } from "@/lib/tools-api"
import { useToast } from "@/hooks/use-toast"

interface EmailResponderToolProps {
  onComplete: (result: { content: string }) => void
}

export function EmailResponderTool({ onComplete }: EmailResponderToolProps) {
  const [emailHistory, setEmailHistory] = useState("")
  const [instructions, setInstructions] = useState("")
  const [tone, setTone] = useState<"formal" | "professional" | "casual" | "friendly">("professional")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!emailHistory || !instructions) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await generateEmailResponse({
        emailHistory,
        instructions,
        tone,
      })

      if (result.success && result.content) {
        onComplete({ content: result.content })
        toast({
          title: "Email generated successfully",
          description: "Your email response is ready to use",
        })
      } else {
        setError(result.error || "Failed to generate email")
        toast({
          title: "Generation failed",
          description: result.error || "Unable to generate email response",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating email:", error)
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
                  onClick={() => setTone(option.value as typeof tone)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
