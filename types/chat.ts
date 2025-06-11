export interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
  parentMessageId?: string | null
  isEdited?: boolean
  editedAt?: Date
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  projectId?: string
  activeLeafMessageId?: string | null
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
