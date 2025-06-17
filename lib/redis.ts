import { Redis } from '@upstash/redis';

// Use the actual Upstash Redis instance provided
const redis = new Redis({
  url: 'https://precise-pipefish-49835.upstash.io',
  token: 'AcKrAAIjcDE2YmM0MDkyOTI2ODk0NTc3OWFlODFiNjljNjk0ZTdmNHAxMA',
});

export class RedisStreamManager {
  private redis: Redis;

  constructor() {
    this.redis = redis;
  }

  // Test Redis connection
  async testConnection(): Promise<boolean> {
    try {
      await this.redis.set('connection-test', 'ok');
      const result = await this.redis.get('connection-test');
      return result === 'ok';
    } catch (error) {
      console.error('Redis connection failed:', error);
      return false;
    }
  }

  // Simple key-value storage for stream chunks (Redis Streams are complex for Upstash REST API)
  async addStreamChunk(sessionId: string, chunk: any): Promise<void> {
    const chunkKey = `stream:${sessionId}:chunks`;
    const chunkData = {
      ...chunk,
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`
    };
    
    // Use Redis list to maintain order
    await this.redis.lpush(chunkKey, JSON.stringify(chunkData));
    
    // Set expiration (24 hours)
    await this.redis.expire(chunkKey, 86400);
  }

  async getStreamChunks(sessionId: string): Promise<any[]> {
    const chunkKey = `stream:${sessionId}:chunks`;
    try {
      const chunks = await this.redis.lrange(chunkKey, 0, -1);
      
      if (!chunks || !Array.isArray(chunks)) {
        return [];
      }
      
      return chunks
        .map(chunk => {
          try {
            if (typeof chunk === 'string') {
              return JSON.parse(chunk);
            }
            return chunk;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error('Error getting chunks:', error);
      return [];
    }
  }

  async setStreamMetadata(sessionId: string, metadata: any): Promise<void> {
    const metaKey = `stream:${sessionId}:meta`;
    await this.redis.set(metaKey, JSON.stringify(metadata));
    await this.redis.expire(metaKey, 86400);
  }

  async getStreamMetadata(sessionId: string): Promise<any | null> {
    const metaKey = `stream:${sessionId}:meta`;
    const meta = await this.redis.get(metaKey);
    
    if (!meta) {
      return null;
    }
    
    // Upstash automatically deserializes JSON, so we can return directly
    return meta;
  }

  async setStreamStatus(sessionId: string, status: 'generating' | 'completed' | 'error', error?: string): Promise<void> {
    const statusKey = `stream:${sessionId}:status`;
    const statusData = {
      status,
      timestamp: Date.now(),
      ...(error && { error })
    };
    
    await this.redis.set(statusKey, JSON.stringify(statusData));
    await this.redis.expire(statusKey, 86400);
  }

  async getStreamStatus(sessionId: string): Promise<{ status: string; timestamp: number; error?: string } | null> {
    const statusKey = `stream:${sessionId}:status`;
    const status = await this.redis.get(statusKey);
    
    if (!status) {
      return null;
    }
    
    // Upstash automatically deserializes JSON, so we can return directly
    return status as { status: string; timestamp: number; error?: string };
  }

  async streamExists(sessionId: string): Promise<boolean> {
    const metaKey = `stream:${sessionId}:meta`;
    const exists = await this.redis.exists(metaKey);
    return exists === 1;
  }

  async deleteStream(sessionId: string): Promise<void> {
    const keys = [
      `stream:${sessionId}:chunks`,
      `stream:${sessionId}:meta`,
      `stream:${sessionId}:status`
    ];
    
    await this.redis.del(...keys);
  }

  async cleanupOldStreams(): Promise<void> {
    // Get all stream keys
    const metaKeys = await this.redis.keys('stream:*:meta');
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const metaKey of metaKeys) {
      const sessionId = metaKey.split(':')[1];
      const metadata = await this.getStreamMetadata(sessionId);
      
      if (metadata && metadata.createdAt && (now - metadata.createdAt > maxAge)) {
        await this.deleteStream(sessionId);
      }
    }
  }
}

export const streamManager = new RedisStreamManager();