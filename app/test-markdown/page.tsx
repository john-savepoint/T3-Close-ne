"use client"

import { ChatMessage } from "@/components/chat-message"

export default function TestMarkdownPage() {
  const markdownContent = `# Markdown Rendering Test

This page demonstrates the **enhanced markdown rendering** capabilities now available in Z6Chat.

## Text Formatting

- **Bold text** using double asterisks
- *Italic text* using single asterisks
- ***Bold and italic*** combined
- ~~Strikethrough~~ using double tildes
- \`Inline code\` using backticks

## Headers

### Level 3 Header
#### Level 4 Header
##### Level 5 Header
###### Level 6 Header

## Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

## Links and Images

[Visit OpenAI](https://openai.com) - External links open in new tabs

## Blockquotes

> This is a blockquote. It can contain multiple lines and even other markdown elements.
>
> Like this second paragraph.

## Code Blocks

\`\`\`javascript
// JavaScript code with syntax highlighting
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("Z6Chat User");
\`\`\`

\`\`\`python
# Python example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Bold/Italic | ✅ | Working perfectly |
| Headers | ✅ | All levels supported |
| Lists | ✅ | Nested lists work |
| Code blocks | ✅ | With syntax highlighting |
| Tables | ✅ | GitHub-flavored markdown |
| Links | ✅ | Open in new tabs |

## Line Breaks

This is a line with a soft break (single newline).
This should appear on the next line.

This is a paragraph with a hard break (double newline).

This is a new paragraph.

## Horizontal Rule

---

## Task Lists (GFM)

- [x] Implement markdown rendering
- [x] Add syntax highlighting
- [ ] Add more features
- [ ] Test all edge cases

## Mermaid Diagram (Special Handling)

\`\`\`mermaid
graph TD
    A[Markdown Text] -->|Parsed| B[React Components]
    B --> C[Styled Output]
    C --> D[Beautiful Display]
\`\`\`

### Simple Mermaid Test

\`\`\`mermaid
flowchart TD
    A[Start] --> B[End]
\`\`\`

## Inline HTML (Sanitized)

<div style="background-color: rgba(147, 51, 234, 0.1); padding: 1rem; border-radius: 0.5rem;">
  This is a custom styled div using inline HTML.
</div>
`

  const messages = [
    {
      id: "1",
      type: "user" as const,
      content: "Show me all the markdown formatting options",
      timestamp: new Date(Date.now() - 60000),
      isDeleted: false,
    },
    {
      id: "2", 
      type: "assistant" as const,
      content: markdownContent,
      timestamp: new Date(),
      isDeleted: false,
      modelId: "openai/gpt-4",
    }
  ]

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold mb-8">Markdown Rendering Test</h1>
      
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            {...message}
            onCopy={(content) => navigator.clipboard.writeText(content)}
          />
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-mauve-dark/20 border border-mauve-dark">
        <h2 className="text-lg font-semibold mb-2">Notes:</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>All standard markdown formatting is now supported</li>
          <li>Code blocks are extracted and rendered with syntax highlighting</li>
          <li>Mermaid diagrams and SVG content have special handling</li>
          <li>Links automatically open in new tabs for safety</li>
          <li>Tables render with proper styling matching the theme</li>
          <li>Inline code has distinctive styling</li>
        </ul>
      </div>
    </div>
  )
}