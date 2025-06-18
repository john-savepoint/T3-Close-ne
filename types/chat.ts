import type { Id } from "@/convex/_generated/dataModel"

export interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  parentMessageId?: string | null
  parentId?: string | null
  isEdited?: boolean
  editedAt?: Date
}

export type ChatStatus = "active" | "archived" | "trashed"

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  projectId?: string
  activeLeafMessageId?: string | null
  status: ChatStatus
  statusChangedAt: Date
}

// Convex database types
export interface ConvexChat {
  _id: Id<"chats">
  _creationTime: number
  title: string
  userId: Id<"users">
  projectId?: Id<"projects">
  activeLeafMessageId?: string
  status: ChatStatus
  statusChangedAt: number
  isPublic?: boolean
  model?: string
  systemPrompt?: string
  createdAt: number
  updatedAt: number
  messageCount?: number
  latestMessage?: {
    content: string
    timestamp: number
    type: "user" | "assistant"
  } | null
}

// Type adapter utility functions
export function adaptConvexChatToChat(convexChat: ConvexChat): Chat {
  return {
    id: convexChat._id,
    title: convexChat.title,
    messages: [], // Messages are loaded separately
    createdAt: new Date(convexChat.createdAt),
    updatedAt: new Date(convexChat.updatedAt),
    projectId: convexChat.projectId,
    activeLeafMessageId: convexChat.activeLeafMessageId,
    status: convexChat.status,
    statusChangedAt: new Date(convexChat.statusChangedAt),
  }
}

export function getChatId(chat: Chat | ConvexChat): Id<"chats"> {
  return ("_id" in chat ? chat._id : chat.id) as Id<"chats">
}

export interface ConversationBranch {
  id: string
  name?: string
  messages: ChatMessage[]
  isActive: boolean
  depth: number
}

export interface ConversationTree {
  branches: ConversationBranch[]
  activeBranchId: string
}

export interface ChatFilters {
  status?: ChatStatus
  projectId?: string
  searchQuery?: string
}
