export type ToolType =
  | "email-responder"
  | "social-media-generator"
  | "summarizer"
  | "diagrammer"
  | "image-generator"
  | "document-editor"

export interface Tool {
  id: ToolType
  name: string
  description: string
  icon: string
  isNew?: boolean
  isBeta?: boolean
  isPopular?: boolean
}

export interface EmailResponderOptions {
  emailHistory: string
  instructions: string
  tone: "formal" | "professional" | "casual" | "friendly"
}

export interface SocialMediaOptions {
  platform: "twitter" | "instagram" | "linkedin" | "facebook" | "tiktok"
  audience: string
  topic: string
  callToAction?: string
  includeHashtags: boolean
}

export interface SummarizerOptions {
  content: string
  length: "short" | "medium" | "detailed"
  format: "paragraph" | "bullet-points"
}

export interface DiagrammerOptions {
  description: string
  type: "flowchart" | "sequence" | "class" | "entity-relationship"
}

export type ToolOptions = EmailResponderOptions | SocialMediaOptions | SummarizerOptions | DiagrammerOptions
