export interface SharedChat {
  id: string
  chatId: string
  ownerUserId: string
  token: string
  isActive: boolean
  createdAt: Date
  viewCount?: number
}

export interface PublicChatView {
  token: string
  title: string
  messages: PublicChatMessage[]
  createdAt: Date
  messageCount: number
  isActive: boolean
}

export interface PublicChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
}

export interface ShareChatData {
  chatId: string
  title?: string
}

export interface ForkChatData {
  token: string
  messages: PublicChatMessage[]
  title?: string
}
