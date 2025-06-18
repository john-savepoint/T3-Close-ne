export interface PromptTemplate {
  id: string
  name: string
  systemPrompt: string
  userPromptTemplate: string
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  "email-responder": {
    id: "email-responder",
    name: "Email Responder",
    systemPrompt: `You are a world-class professional communication assistant. Your task is to draft email responses based on the provided context and instructions.

RULES:
- Respond ONLY with the body of the email
- Do not include a subject line unless explicitly asked
- Do not include a greeting or sign-off unless it is part of the user's instructions
- Maintain professionalism and clarity
- Match the requested tone exactly`,
    userPromptTemplate: `EMAIL HISTORY (for context):
---
{{emailHistory}}
---

USER'S INSTRUCTIONS (your goal for the reply):
---
{{instructions}}
---

TONE: {{tone}}

Now, generate the email response.`,
  },

  "social-media-generator": {
    id: "social-media-generator",
    name: "Social Media Generator",
    systemPrompt: `You are an expert social media content creator. You create engaging, platform-specific content that resonates with the target audience.

RULES:
- Generate content optimized for the specific platform
- Include relevant hashtags for discoverability
- Match the brand voice and target audience
- Keep within platform character limits
- Make content shareable and engaging`,
    userPromptTemplate: `Create {{count}} engaging {{platform}} post(s) about:
"{{topic}}"

Target audience: {{audience}}
{{callToAction ? 'Call to action: ' + callToAction : ''}}
{{includeHashtags ? 'Include relevant hashtags.' : ''}}

Format the post(s) exactly as they would appear on {{platform}}, including any platform-specific conventions.`,
  },

  "summarizer": {
    id: "summarizer",
    name: "Summarizer",
    systemPrompt: `You are an expert at condensing information while preserving key insights. You create clear, concise summaries that capture the essence of the content.

RULES:
- Maintain accuracy and don't add information not in the source
- Use the requested format (paragraph or bullet points)
- Match the requested length while being comprehensive
- Preserve important details and context
- Use clear, accessible language`,
    userPromptTemplate: `Please provide a {{length}} summary of the following content in {{format}} format:
---
{{content}}
---`,
  },

  "diagrammer": {
    id: "diagrammer",
    name: "Diagrammer",
    systemPrompt: `You are an expert at creating visual diagrams using Mermaid.js syntax. You translate complex ideas into clear, well-structured diagrams.

RULES:
- Use only valid Mermaid.js syntax
- Create clear, readable diagrams
- Use appropriate diagram types for the content
- Include helpful labels and descriptions
- Ensure the diagram is logically organized`,
    userPromptTemplate: `Create a {{type}} diagram based on this description:
"{{description}}"

Use Mermaid.js syntax and ensure the diagram is clear and well-structured.

Start your response with the Mermaid code block:
\`\`\`mermaid
[your diagram code here]
\`\`\``,
  },
}

export function fillTemplate(template: string, variables: Record<string, any>): string {
  let filled = template
  
  // Handle conditional sections first (e.g., {{condition ? 'text' : ''}})
  filled = filled.replace(/\{\{(\w+)\s*\?\s*'([^']+)'\s*\+\s*(\w+)\s*:\s*''\}\}/g, (match, condition, text, variable) => {
    return variables[condition] ? text + variables[variable] : ''
  })
  
  filled = filled.replace(/\{\{(\w+)\s*\?\s*'([^']+)'\s*:\s*''\}\}/g, (match, condition, text) => {
    return variables[condition] ? text : ''
  })
  
  // Then handle simple variable replacements
  filled = filled.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
  
  return filled.trim()
}

export function getPromptTemplate(toolId: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[toolId]
}

export function generateFullPrompt(toolId: string, variables: Record<string, any>): {
  systemPrompt: string
  userPrompt: string
} | null {
  const template = getPromptTemplate(toolId)
  if (!template) return null
  
  return {
    systemPrompt: template.systemPrompt,
    userPrompt: fillTemplate(template.userPromptTemplate, variables),
  }
}