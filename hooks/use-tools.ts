"use client"

import { useState } from "react"
import type { Tool, ToolType, ToolOptions } from "@/types/tools"
import { Mail, Instagram, FileText, GitBranch, ImageIcon, FileEdit, Star } from "lucide-react"

export function useTools() {
  const [tools] = useState<Tool[]>([
    {
      id: "email-responder",
      name: "Email Responder",
      description: "Draft perfect email replies based on conversation history",
      icon: "Mail",
      isPopular: true,
    },
    {
      id: "social-media-generator",
      name: "Social Media Generator",
      description: "Create engaging posts for any platform and audience",
      icon: "Instagram",
      isNew: true,
    },
    {
      id: "summarizer",
      name: "Summarizer",
      description: "Condense long content into concise summaries",
      icon: "FileText",
    },
    {
      id: "diagrammer",
      name: "Diagrammer",
      description: "Visualize processes, flows, and relationships",
      icon: "GitBranch",
      isBeta: true,
    },
    {
      id: "image-generator",
      name: "Image Generator",
      description: "Create custom images from text descriptions",
      icon: "ImageIcon",
      isBeta: true,
    },
    {
      id: "document-editor",
      name: "Document Editor",
      description: "Collaborative AI-assisted document editing",
      icon: "FileEdit",
      isBeta: true,
    },
  ])

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case "Mail":
        return Mail
      case "Instagram":
        return Instagram
      case "FileText":
        return FileText
      case "GitBranch":
        return GitBranch
      case "ImageIcon":
        return ImageIcon
      case "FileEdit":
        return FileEdit
      case "Star":
        return Star
      default:
        return FileText
    }
  }

  const generatePrompt = (toolId: ToolType, options: ToolOptions): string => {
    switch (toolId) {
      case "email-responder":
        const emailOpts = options as any
        return `
          Based on the following email history:
          ---
          ${emailOpts.emailHistory}
          ---
          
          Please draft a ${emailOpts.tone} email response that:
          ${emailOpts.instructions}
          
          Only provide the email body text, no subject line or greeting unless specifically requested.
        `

      case "social-media-generator":
        const socialOpts = options as any
        return `
          Create an engaging ${socialOpts.platform} post about:
          "${socialOpts.topic}"
          
          Target audience: ${socialOpts.audience}
          ${socialOpts.callToAction ? `Call to action: ${socialOpts.callToAction}` : ""}
          ${socialOpts.includeHashtags ? "Please include relevant hashtags." : ""}
          
          Format the post exactly as it would appear on ${socialOpts.platform}, including any platform-specific conventions.
        `

      case "summarizer":
        const summaryOpts = options as any
        return `
          Please provide a ${summaryOpts.length} summary of the following content in ${summaryOpts.format} format:
          ---
          ${summaryOpts.content}
          ---
        `

      case "diagrammer":
        const diagramOpts = options as any
        return `
          Create a ${diagramOpts.type} diagram based on this description:
          "${diagramOpts.description}"
          
          Use Mermaid.js syntax and ensure the diagram is clear and well-structured.
        `

      default:
        return ""
    }
  }

  return {
    tools,
    getToolIcon,
    generatePrompt,
  }
}
