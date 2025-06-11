export interface TemporaryChat {
  id: string
  messages: TemporaryChatMessage[]
  createdAt: Date
  isTemporary: true
  model?: string
}

export interface TemporaryChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
}

export interface TemporaryChatSettings {
  includeMemoryInTempChats: boolean
  autoDeletePolicy: "session" | "24h" | "7d" | "30d"
  showTempChatWarnings: boolean
}

export interface SaveTempChatData {
  title: string
  projectId?: string
}
