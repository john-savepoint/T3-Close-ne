"use client"

import { CodeBlockEnhanced } from "@/components/code-block-enhanced"

const testCode = {
  javascript: `function greetUser(name) {
  console.log('Hello, ' + name + '!');
  return \`Welcome, \${name}\`;
}

const users = ['Alice', 'Bob', 'Charlie'];
users.forEach(user => {
  console.log(greetUser(user));
});`,

  typescript: `interface User {
  id: number;
  name: string;
  email: string;
}

function fetchUsers(): Promise<User[]> {
  return fetch('/api/users')
    .then(response => response.json())
    .catch(error => {
      console.error('Failed to fetch users:', error);
      throw error;
    });
}

const handleUser = async (userId: number): Promise<void> => {
  try {
    const users = await fetchUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    console.log(\`Found user: \${user.name}\`);
  } catch (error) {
    console.error('Error handling user:', error);
  }
};`,

  tsx: `import React, { useState, useEffect } from 'react';

interface Props {
  initialCount?: number;
}

export const Counter: React.FC<Props> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div className="counter">
      <h2>Counter Component</h2>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
};`,

  python: `from typing import List, Optional
import asyncio
import aiohttp

class UserManager:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_users(self) -> List[dict]:
        if not self.session:
            raise RuntimeError("UserManager not initialized")
        
        async with self.session.get(f"{self.base_url}/users") as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"Failed to fetch users: {response.status}")

async def main():
    async with UserManager("https://api.example.com") as manager:
        users = await manager.fetch_users()
        for user in users:
            print(f"User: {user['name']} ({user['email']})")

if __name__ == "__main__":
    asyncio.run(main())`,

  css: `/* Modern CSS with Grid and Flexbox */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}`,

  json: `{
  "name": "syntax-highlighting-demo",
  "version": "1.0.0",
  "description": "A comprehensive demo of syntax highlighting capabilities",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "jest": "^29.0.0",
    "webpack": "^5.0.0"
  },
  "keywords": [
    "syntax",
    "highlighting",
    "code",
    "demo"
  ],
  "author": "Claude AI",
  "license": "MIT"
}`
}

export function SyntaxTest() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-8">Syntax Highlighting Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">JavaScript</h2>
          <CodeBlockEnhanced 
            code={testCode.javascript}
            language="javascript"
            showLineNumbers={true}
            showActions={true}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">TypeScript</h2>
          <CodeBlockEnhanced 
            code={testCode.typescript}
            language="typescript"
            showLineNumbers={true}
            showActions={true}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">TypeScript React (TSX)</h2>
          <CodeBlockEnhanced 
            code={testCode.tsx}
            language="tsx"
            showLineNumbers={true}
            showActions={true}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Python</h2>
          <CodeBlockEnhanced 
            code={testCode.python}
            language="python"
            showLineNumbers={true}
            showActions={true}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">CSS</h2>
          <CodeBlockEnhanced 
            code={testCode.css}
            language="css"
            showLineNumbers={true}
            showActions={true}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">JSON</h2>
          <CodeBlockEnhanced 
            code={testCode.json}
            language="json"
            showLineNumbers={true}
            showActions={true}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Auto-Detected Language (TypeScript)</h2>
          <CodeBlockEnhanced 
            code={testCode.typescript}
            filename="api.ts"
            showLineNumbers={true}
            showActions={true}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Line Highlighting Demo</h2>
          <CodeBlockEnhanced 
            code={testCode.javascript}
            language="javascript"
            highlightLines={[2, 3, 7]}
            showLineNumbers={true}
            showActions={true}
            title="Highlighted Lines Example"
          />
        </div>
      </div>
    </div>
  )
}