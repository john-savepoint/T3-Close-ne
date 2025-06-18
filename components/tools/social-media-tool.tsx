"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import { generateSocialMediaPost } from "@/lib/tools-api"
import { useToast } from "@/hooks/use-toast"

interface SocialMediaToolProps {
  onComplete: (result: { content: string }) => void
}

export function SocialMediaTool({ onComplete }: SocialMediaToolProps) {
  const [platform, setPlatform] = useState<"twitter" | "instagram" | "linkedin" | "facebook" | "tiktok">("twitter")
  const [topic, setTopic] = useState("")
  const [audience, setAudience] = useState("")
  const [callToAction, setCallToAction] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [posts, setPosts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!topic) return

    setIsLoading(true)
    setError(null)
    setPosts([])

    try {
      const result = await generateSocialMediaPost({
        platform,
        topic,
        audience: audience || "general audience",
        callToAction: callToAction || undefined,
        includeHashtags: true,
        count: 3,
      })

      if (result.success && result.content) {
        // Parse the response to extract individual posts
        const postMatches = result.content.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n*$)/gs)
        const extractedPosts = postMatches 
          ? postMatches.map(match => match.replace(/^\d+\.\s*/, '').trim())
          : [result.content]
        
        setPosts(extractedPosts)
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
      setIsLoading(false)
    }
  }

  const handleSelectPost = (post: string) => {
    // Format with platform context
    const platformContext =
      platform === "twitter" ? "Twitter" : platform === "instagram" ? "Instagram" : "LinkedIn"

    const contentWithContext = `**${platformContext} Post:**\n\n${post}`
    onComplete({ content: contentWithContext })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Platform</label>
            <Select value={platform} onValueChange={(value) => setPlatform(value as typeof platform)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Topic/Product</label>
            <Input
              placeholder="What are you posting about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Target Audience</label>
            <Input
              placeholder="Who is your audience?"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Call to Action (Optional)</label>
            <Input
              placeholder="What action should readers take?"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerate} disabled={!topic || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Posts"
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Generated Posts</label>

          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post, index) => (
                <Card key={index} className="bg-mauve-surface/30 p-3">
                  <p className="mb-2 whitespace-pre-line text-sm">{post}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSelectPost(post)}
                  >
                    Use This Post
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-md border bg-mauve-surface/10 text-sm text-mauve-subtle/70">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="mb-2 h-5 w-5 animate-spin" />
                  <p>Crafting your social posts...</p>
                </div>
              ) : (
                "Generated posts will appear here"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
