"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTools } from "@/hooks/use-tools"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Send, Loader2 } from "lucide-react"

export default function EmailResponderPage() {
  const router = useRouter()
  const { generatePrompt } = useTools()
  const [emailHistory, setEmailHistory] = useState("")
  const [instructions, setInstructions] = useState("")
  const [tone, setTone] = useState<"formal" | "professional" | "casual" | "friendly">("professional")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState("")

  const handleGenerate = async () => {
    if (!emailHistory || !instructions) return

    setIsGenerating(true)

    try {
      // In a real implementation, this would call your AI service
      // For now, we'll simulate a response after a delay
      const prompt = generatePrompt("email-responder", {
        emailHistory,
        instructions,
        tone,
      })

      console.log("Generated prompt:", prompt)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Sample response
      setGeneratedEmail(`Dear Team,

Thank you for your email regarding the project timeline extension request. 

After careful consideration, I regret to inform you that we are unable to extend the deadline beyond the originally agreed date of October 15th. The company policy requires all Q4 projects to be completed by this date to ensure proper financial reporting and year-end processing.

The policy will take effect as scheduled on September 1st, and all departments are expected to adhere to this timeline. Our team is available to provide any support needed to help you meet this deadline.

Please let me know if you have any questions or if there's anything else I can assist with.

Best regards,`)

      // In a real implementation, you would start a new chat with this context
      // router.push(`/chat/new?with-context=${encodeURIComponent(JSON.stringify({
      //   tool: "email-responder",
      //   emailHistory,
      //   instructions,
      //   tone,
      //   response: generatedEmail
      // }))}`);
    } catch (error) {
      console.error("Error generating email:", error)
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
          <Mail className="h-8 w-8" />
          <span>Email Responder</span>
        </h1>
        <p className="text-mauve-subtle/70">
          Draft perfect email replies based on conversation history and your instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <label className="block text-sm font-medium mb-2">Email History</label>
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
              <label className="block text-sm font-medium mb-2">Your Instructions</label>
              <Textarea
                placeholder="Describe what you want to say in your reply..."
                className="min-h-[100px] mb-4"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tone</label>
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
        </div>

        <div>
          <Card className="h-full">
            <CardContent className="p-6 h-full flex flex-col">
              <h3 className="font-medium mb-4">Generated Email</h3>

              {!generatedEmail ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-mauve-subtle/20 rounded-lg p-8">
                  <div className="text-center text-mauve-subtle/50">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated email will appear here</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 border border-mauve-subtle/20 rounded-lg p-4 mb-4 whitespace-pre-wrap overflow-auto">
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
