"use client"

import { useState } from "react"
import { ChatMessage } from "@/components/chat-message"
import { EnhancedModelSwitcher } from "@/components/enhanced-model-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot } from "lucide-react"

export default function TestRenderingPage() {
  const [temperature, setTemperature] = useState(0.7)
  const [showModelSwitcher, setShowModelSwitcher] = useState(false)
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini")

  // Sample messages with different content types
  const testMessages = [
    {
      id: "1",
      type: "assistant" as const,
      content: `Here's a Mermaid diagram showing a simple authentication flow:

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as Database
    
    U->>C: Enter credentials
    C->>S: POST /auth/login
    S->>DB: Verify credentials
    DB-->>S: User data
    S-->>C: JWT token
    C-->>U: Login successful
\`\`\`

This shows the basic flow of user authentication.`,
      timestamp: new Date(),
      model: selectedModel,
    },
    {
      id: "2",
      type: "assistant" as const,
      content: `Here's an SVG icon for a settings gear:

\`\`\`svg
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="#8b5cf6" transform="translate(50, 50)">
    <circle r="20" fill="#a78bfa"/>
    <g>
      <rect x="-5" y="-40" width="10" height="20" rx="2"/>
      <rect x="-5" y="20" width="10" height="20" rx="2"/>
      <rect x="-40" y="-5" width="20" height="10" rx="2"/>
      <rect x="20" y="-5" width="20" height="10" rx="2"/>
      <rect x="-30" y="-30" width="15" height="10" rx="2" transform="rotate(45)"/>
      <rect x="15" y="-30" width="15" height="10" rx="2" transform="rotate(45)"/>
      <rect x="-30" y="20" width="15" height="10" rx="2" transform="rotate(-45)"/>
      <rect x="15" y="20" width="15" height="10" rx="2" transform="rotate(-45)"/>
    </g>
  </g>
</svg>
\`\`\`

This SVG has been sanitized for safe rendering.`,
      timestamp: new Date(),
      model: selectedModel,
    },
    {
      id: "3",
      type: "assistant" as const,
      content: `Here's an interactive HTML example with CSS:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            transition: transform 0.3s;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        button:hover {
            background: #764ba2;
        }
        #message {
            margin-top: 20px;
            font-size: 18px;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Interactive Demo</h1>
        <p>Click the button to see the magic!</p>
        <button onclick="showMessage()">Click Me!</button>
        <div id="message"></div>
    </div>
    
    <script>
        function showMessage() {
            const messages = [
                "Hello from the Code Canvas! 🎉",
                "This is running in a sandboxed iframe 🔒",
                "Try clicking again for a different message! 🎲",
                "Advanced rendering is awesome! ✨"
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            document.getElementById('message').innerHTML = randomMessage;
        }
    </script>
</body>
</html>
\`\`\`

This demonstrates the live preview feature with the Code Canvas component.`,
      timestamp: new Date(),
      model: selectedModel,
    },
    {
      id: "4",
      type: "assistant" as const,
      content: `Here's a JavaScript example that runs in the preview:

\`\`\`javascript
// Fibonacci sequence generator
function fibonacci(n) {
    const sequence = [0, 1];
    
    for (let i = 2; i < n; i++) {
        sequence.push(sequence[i-1] + sequence[i-2]);
    }
    
    return sequence;
}

// Generate first 10 Fibonacci numbers
const result = fibonacci(10);
console.log("Fibonacci sequence:", result);

// Calculate sum
const sum = result.reduce((a, b) => a + b, 0);
console.log("Sum of sequence:", sum);

// Find even numbers
const evens = result.filter(n => n % 2 === 0);
console.log("Even numbers:", evens);
\`\`\`

The JavaScript code runs in a sandboxed environment and outputs to the console.`,
      timestamp: new Date(),
      model: selectedModel,
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Advanced Rendering Test Page
          </CardTitle>
          <CardDescription>
            Test the advanced generation controls and rendering features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={() => setShowModelSwitcher(true)}
              >
                Model: {selectedModel}
              </Button>
              <div className="text-sm text-muted-foreground">
                Temperature: {temperature.toFixed(2)}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✅ Temperature control in model switcher</p>
              <p>✅ Mermaid diagram rendering</p>
              <p>✅ SVG rendering with sanitization</p>
              <p>✅ Code Canvas with live preview</p>
              <p>✅ Security headers and content sanitization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Test Messages</h2>
        {testMessages.map((message) => (
          <ChatMessage
            key={message.id}
            {...message}
            onEdit={(id, content) => console.log("Edit:", id, content)}
            onDelete={(id) => console.log("Delete:", id)}
            onRegenerate={(id) => console.log("Regenerate:", id)}
            onCopy={(content) => navigator.clipboard.writeText(content)}
          />
        ))}
      </div>

      <EnhancedModelSwitcher
        isOpen={showModelSwitcher}
        onClose={() => setShowModelSwitcher(false)}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        temperature={temperature}
        onTemperatureChange={setTemperature}
      />
    </div>
  )
}