export interface Project {
  id: string
  name: string
  systemPrompt?: string
  parentProjectId?: string
  createdAt: Date
  updatedAt: Date
  attachments: ProjectAttachment[]
  chats: ProjectChat[]
}

export interface ProjectAttachment {
  id: string
  projectId: string
  attachmentId: string
  name: string
  type: string
  size: number
  content?: string
}

export interface ProjectChat {
  id: string
  projectId: string
  title: string
  lastMessage?: string
  updatedAt: Date
  messageCount: number
}

export interface CreateProjectData {
  name: string
  systemPrompt?: string
  parentProjectId?: string
}
