"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Instagram, Twitter, Linkedin, Facebook, Send, Loader2, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateSocialMediaPost } from "@/lib/tools-api"
import { useToast } from "@/hooks/use-toast"

export default function SocialMediaGeneratorPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState<
    "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok"
  >("instagram")
  const [audience, setAudience] = useState("")
  const [topic, setTopic] = useState("")
  const [callToAction, setCallToAction] = useState("")
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!audience || !topic) return

    setIsGenerating(true)
    setError(null)
    setGeneratedPosts([])

    try {
      const result = await generateSocialMediaPost({
        platform,
        topic,
        audience,
        callToAction: callToAction || undefined,
        includeHashtags,
        count: 3,
      })

      if (result.success && result.content) {
        // Parse the response to extract individual posts
        const postMatches = result.content.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n*$)/gs)
        const extractedPosts = postMatches 
          ? postMatches.map(match => match.replace(/^\d+\.\s*/, '').trim())
          : [result.content]
        
        setGeneratedPosts(extractedPosts)
        toast({
          title: "Posts generated successfully",
          description: `Created ${extractedPosts.length} ${platform} posts`,
        })
      } else {
        setError(result.error || "Failed to generate posts")
        toast({
          title: "Generation failed",
          description: result.error || "Unable to generate social media posts",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating posts:", error)
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

  const getPlatformIcon = () => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-8 w-8" />
      case "twitter":
        return <Twitter className="h-8 w-8" />
      case "linkedin":
        return <Linkedin className="h-8 w-8" />
      case "facebook":
        return <Facebook className="h-8 w-8" />
      case "tiktok":
        return <span className="text-2xl">TikTok</span>
      default:
        return <Instagram className="h-8 w-8" />
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
          {getPlatformIcon()}
          <span>Social Media Generator</span>
        </h1>
        <p className="text-mauve-subtle/70">Create engaging posts for any platform and audience.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Platform</label>
                  <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Target Audience</label>
                  <Input
                    placeholder="e.g., Tech-savvy young adults, Business professionals"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Topic or Product</label>
                  <Textarea
                    placeholder="What are you posting about? Be specific."
                    className="min-h-[100px]"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Call to Action (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Visit our website, Sign up now"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hashtags"
                    checked={includeHashtags}
                    onCheckedChange={setIncludeHashtags}
                  />
                  <Label htmlFor="hashtags">Include relevant hashtags</Label>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating || !audience || !topic}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Posts
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
              <h3 className="mb-4 font-medium">Generated Posts</h3>

              {generatedPosts.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-mauve-subtle/20 p-8">
                  <div className="text-center text-mauve-subtle/50">
                    {getPlatformIcon()}
                    <p className="mt-4">Your generated posts will appear here</p>
                  </div>
                </div>
              ) : (
                <>
                  <Tabs defaultValue="0" className="flex flex-1 flex-col">
                    <TabsList className="mb-4">
                      {generatedPosts.map((_, index) => (
                        <TabsTrigger key={index} value={index.toString()}>
                          Option {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {generatedPosts.map((post, index) => (
                      <TabsContent
                        key={index}
                        value={index.toString()}
                        className="flex flex-1 flex-col"
                      >
                        <div className="mb-4 flex-1 overflow-auto whitespace-pre-wrap rounded-lg border border-mauve-subtle/20 p-4">
                          {post}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const activeTab = document.querySelector('[role="tabpanel"]:not([hidden])')
                        const activeContent = activeTab?.textContent || ""
                        navigator.clipboard.writeText(activeContent)
                      }}
                    >
                      Copy Selected
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
