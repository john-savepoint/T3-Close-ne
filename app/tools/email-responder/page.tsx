"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Send, Loader2, AlertCircle } from "lucide-react"
import { generateEmailResponse } from "@/lib/tools-api"
import { useToast } from "@/hooks/use-toast"
import { createChatUrl } from "@/lib/tool-chat-integration"

export default function EmailResponderPage() {
  const router = useRouter()
  const [emailHistory, setEmailHistory] = useState("")
  const [instructions, setInstructions] = useState("")
  const [tone, setTone] = useState<"formal" | "professional" | "casual" | "friendly">(
    "professional"
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!emailHistory || !instructions) return

    setIsGenerating(true)
    setError(null)

    try {
      const result = await generateEmailResponse({
        emailHistory,
        instructions,
        tone,
      })

      if (result.success && result.content) {
        setGeneratedEmail(result.content)
        toast({
          title: "Email generated successfully",
          description: "Your email response is ready",
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
      setIsGenerating(false)
    }
  }

  const handleContinueInChat = () => {
    const context = {
      toolId: "email-responder",
      toolName: "Email Responder",
      input: {
        emailHistory,
        instructions,
        tone,
      },
      result: generatedEmail,
    }
    
    router.push(createChatUrl(context))
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          <Mail className="h-8 w-8" />
          <span>Email Responder</span>
        </h1>
        <p className="text-mauve-subtle/70">
          Draft perfect email replies based on conversation history and your instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <label className="mb-2 block text-sm font-medium">Email History</label>
              <Textarea
                placeholder="Paste the email thread or conversation history here..."
                className="min-h-[200px]"
                value={emailHistory}
                onChange={(e) => setEmailHistory(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <label className="mb-2 block text-sm font-medium">Your Instructions</label>
              <Textarea
                placeholder="Describe what you want to say in your reply..."
                className="mb-4 min-h-[100px]"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={tone === "formal" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTone("formal")}
                    >
                      Formal
                    </Button>
                    <Button
                      variant={tone === "professional" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTone("professional")}
                    >
                      Professional
                    </Button>
                    <Button
                      variant={tone === "casual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTone("casual")}
                    >
                      Casual
                    </Button>
                    <Button
                      variant={tone === "friendly" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTone("friendly")}
                    >
                      Friendly
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating || !emailHistory || !instructions}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Email
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
              <h3 className="mb-4 font-medium">Generated Email</h3>

              {!generatedEmail ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-mauve-subtle/20 p-8">
                  <div className="text-center text-mauve-subtle/50">
                    <Mail className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Your generated email will appear here</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex-1 overflow-auto whitespace-pre-wrap rounded-lg border border-mauve-subtle/20 p-4">
                    {generatedEmail}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigator.clipboard.writeText(generatedEmail)}
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
