import { customAlphabet } from "nanoid";
import { streamManager } from "./redis";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 12);

export interface StreamChunk {
  type: 'chunk' | 'complete' | 'error' | 'connected' | 'metadata';
  content?: string;
  error?: string;
  index?: string;
  timestamp?: string;
  metadata?: {
    model?: string;
    usage?: any;
    sessionId?: string;
  };
}

export interface StreamSession {
  id: string;
  prompt: string;
  model: string;
  createdAt: number;
  status: 'generating' | 'completed' | 'error';
  totalChunks?: number;
}

export class ResumableStream {
  private sessionId: string;
  private streamKey: string;
  private prompt: string;
  private model: string;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
    this.streamKey = `stream:${this.sessionId}`;
    this.prompt = '';
    this.model = '';
  }

  private generateSessionId(): string {
    return nanoid();
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getStreamKey(): string {
    return this.streamKey;
  }

  async initializeSession(prompt: string, model: string): Promise<void> {
    this.prompt = prompt;
    this.model = model;

    await streamManager.initializeStream(this.streamKey, 'generators');
    await streamManager.initializeStream(this.streamKey, 'consumers');

    // Store session metadata
    await streamManager.addToStream(this.streamKey, {
      type: 'metadata',
      sessionId: this.sessionId,
      prompt: prompt,
      model: model,
      status: 'generating',
      timestamp: Date.now().toString(),
    });
  }

  async addChunk(content: string, index: number): Promise<void> {
    await streamManager.addToStream(this.streamKey, {
      type: 'chunk',
      content: content,
      index: index.toString(),
      timestamp: Date.now().toString(),
    });
  }

  async markComplete(totalChunks?: number): Promise<void> {
    await streamManager.addToStream(this.streamKey, {
      type: 'complete',
      timestamp: Date.now().toString(),
      ...(totalChunks && { totalChunks: totalChunks.toString() }),
    });
  }

  async markError(error: string): Promise<void> {
    await streamManager.addToStream(this.streamKey, {
      type: 'error',
      error: error,
      timestamp: Date.now().toString(),
    });
  }

  async getSessionInfo(): Promise<StreamSession | null> {
    const streamInfo = await streamManager.getStreamInfo(this.streamKey);
    if (!streamInfo) return null;

    // Read the first message which should contain metadata
    const messages = await streamManager.readFromStart(this.streamKey, "0");
    if (!messages || messages.length === 0) return null;

    const [, msgs] = messages[0];
    if (!msgs || msgs.length === 0) return null;

    const [, fields] = msgs[0];
    const data = this.parseRedisFields(fields);

    if (data.type === 'metadata') {
      return {
        id: this.sessionId,
        prompt: data.prompt || '',
        model: data.model || '',
        createdAt: parseInt(data.timestamp || '0'),
        status: this.determineStatus(streamInfo),
      };
    }

    return null;
  }

  private parseRedisFields(fields: string[]): Record<string, string> {
    const data: Record<string, string> = {};
    for (let i = 0; i < fields.length; i += 2) {
      data[fields[i]] = fields[i + 1];
    }
    return data;
  }

  private determineStatus(streamInfo: any): 'generating' | 'completed' | 'error' {
    // This is a simplified status determination
    // In a real implementation, you'd scan for the last message type
    return 'generating';
  }

  async *readAllChunks(): AsyncGenerator<StreamChunk> {
    const messages = await streamManager.readFromStart(this.streamKey, "0");
    if (!messages) return;

    for (const [, msgs] of messages) {
      for (const [, fields] of msgs) {
        const data = this.parseRedisFields(fields);
        yield data as StreamChunk;
      }
    }
  }

  async getProgress(): Promise<{ totalChunks: number; status: string }> {
    const streamInfo = await streamManager.getStreamInfo(this.streamKey);
    if (!streamInfo) return { totalChunks: 0, status: 'not_found' };

    const length = streamInfo.length || 0;
    const status = this.determineStatus(streamInfo);

    return { totalChunks: length, status };
  }

  static async cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    await streamManager.cleanupOldStreams(maxAgeMs);
  }

  static async getSessionById(sessionId: string): Promise<ResumableStream> {
    return new ResumableStream(sessionId);
  }
}

export async function generateLLMStream(
  stream: ResumableStream,
  prompt: string,
  model: string = 'openai/gpt-4o-mini'
): Promise<void> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Z6Chat',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let chunkIndex = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            
            if (content) {
              await stream.addChunk(content, chunkIndex);
              chunkIndex++;
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }
    }

    await stream.markComplete(chunkIndex);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await stream.markError(errorMessage);
    console.error('LLM Stream generation error:', error);
  }
}