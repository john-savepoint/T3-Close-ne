import type { Metadata } from "next"
import { PublicChatView } from "@/components/public-chat-view"

interface PageProps {
  params: Promise<{ token: string }>
}

// Fetch shared chat data from API
async function getSharedChat(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/shared/${token}`, {
      cache: 'no-store', // Don't cache since view counts need to be accurate
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    // Convert timestamps back to Date objects
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      messages: data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }
  } catch (error) {
    console.error("Failed to fetch shared chat:", error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const chat = await getSharedChat(token)

  if (!chat?.isActive) {
    return {
      title: "Shared Chat Not Found - Z6Chat",
      description: "This shared chat link is no longer active.",
    }
  }

  const firstUserMessage = chat.messages.find((m) => m.type === "user")?.content || ""
  const preview =
    firstUserMessage.length > 150 ? firstUserMessage.substring(0, 150) + "..." : firstUserMessage

  return {
    title: `${chat.title} - Shared on Z6Chat`,
    description: preview || "View this AI conversation shared on Z6Chat",
    openGraph: {
      title: chat.title,
      description: preview,
      type: "article",
      siteName: "Z6Chat",
    },
    twitter: {
      card: "summary",
      title: chat.title,
      description: preview,
    },
  }
}

export default async function SharedChatPage({ params }: PageProps) {
  const { token } = await params
  const chat = await getSharedChat(token)

  if (!chat?.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Chat Not Found</h1>
          <p className="text-mauve-subtle/70">
            This shared chat link is no longer active or doesn't exist.
          </p>
        </div>
      </div>
    )
  }

  return <PublicChatView chat={chat} />
}
