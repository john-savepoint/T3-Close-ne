// Prompt engineering service for AI tools
interface PromptTemplate {
  system: string
  user: (vars: Record<string, any>) => string
}

const promptTemplates: Record<string, PromptTemplate> = {
  "email-responder": {
    system: `You are an expert email response assistant. Your task is to generate professional, contextually appropriate email responses based on the provided email history and specific instructions.

Guidelines:
- Maintain a professional and appropriate tone
- Be concise but comprehensive
- Address all points raised in the instructions
- Ensure the response is contextually relevant to the email thread
- Use proper email etiquette and formatting
- Adapt your writing style to match the requested tone`,
    user: (vars) => `
Email History:
${vars.emailHistory}

Instructions for Response:
${vars.instructions}

Tone: ${vars.tone}

Please generate a professional email response that addresses the instructions while maintaining the specified tone. Format it as a complete email ready to send.`,
  },

  "social-media-generator": {
    system: `You are a social media content expert specializing in creating engaging, platform-optimized content. You understand the unique characteristics, audience expectations, and best practices for each social platform.

Platform Guidelines:
- Twitter: Concise, engaging, hashtag-optimized (280 chars)
- Instagram: Visual storytelling, engaging captions, strategic hashtags
- LinkedIn: Professional, thought leadership, industry insights
- Facebook: Community-focused, shareable, conversation-starting
- TikTok: Trendy, authentic, hooks that grab attention

Always create multiple variations for A/B testing purposes.`,
    user: (vars) => `
Platform: ${vars.platform}
Topic: ${vars.topic}
Target Audience: ${vars.audience}
${vars.callToAction ? `Call to Action: ${vars.callToAction}` : ""}
Include Hashtags: ${vars.includeHashtags ? "Yes" : "No"}

Generate 3 different ${vars.platform} posts about "${vars.topic}" for the target audience "${vars.audience}". Each post should be optimized for the platform and include engaging content that resonates with the audience.

Format as:
1. [First post]

2. [Second post]

3. [Third post]`,
  },

  summarizer: {
    system: `You are an expert text summarization specialist. Your task is to create accurate, comprehensive summaries that capture the essential information while maintaining clarity and readability.

Summarization Principles:
- Preserve key facts, figures, and important details
- Maintain logical flow and structure
- Eliminate redundancy and filler content
- Adapt length and format to user specifications
- Ensure accuracy and objectivity`,
    user: (vars) => `
Content to Summarize:
${vars.content}

Summary Requirements:
- Length: ${vars.length}
- Format: ${vars.format}

Please create a ${vars.length} summary in ${vars.format} format that captures the essential information from the provided content.`,
  },

  diagrammer: {
    system: `You are a technical diagramming expert specializing in Mermaid.js syntax. You create clear, well-structured diagrams that effectively communicate processes, relationships, and system architectures.

Mermaid Diagram Types:
- Flowchart: Process flows, decision trees, workflows
- Sequence: Interactions between entities over time
- Class: Object-oriented relationships and structures
- Entity Relationship: Database schemas and data relationships

Always output valid Mermaid syntax wrapped in code blocks.`,
    user: (vars) => `
Description: ${vars.description}
Diagram Type: ${vars.diagramType}

Create a ${vars.diagramType} diagram using Mermaid.js syntax that accurately represents: "${vars.description}"

Requirements:
- Use proper Mermaid syntax for ${vars.diagramType} diagrams
- Include clear, descriptive labels
- Structure the diagram logically
- Ensure it's visually clear and easy to understand

Output the diagram code wrapped in a \`\`\`mermaid code block.`,
  },
}

export function getPromptTemplate(toolId: string, variables: Record<string, any>) {
  const template = promptTemplates[toolId]
  if (!template) {
    throw new Error(`No prompt template found for tool: ${toolId}`)
  }

  return {
    systemPrompt: template.system,
    userPrompt: template.user(variables),
  }
}

export function listAvailableTools(): string[] {
  return Object.keys(promptTemplates)
}
