import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export class RedisStreamManager {
  private redis: Redis;

  constructor() {
    this.redis = redis;
  }

  async initializeStream(streamKey: string, groupName: string): Promise<void> {
    try {
      await this.redis.xgroup("CREATE", streamKey, groupName, "0", "MKSTREAM");
    } catch (error) {
      // Group might already exist - that's okay
      console.log('Consumer group may already exist:', error);
    }
  }

  async addToStream(streamKey: string, data: Record<string, string>): Promise<string> {
    return await this.redis.xadd(streamKey, "*", data);
  }

  async readStream(
    streamKey: string, 
    groupName: string, 
    consumerName: string, 
    count = 10
  ): Promise<any> {
    return await this.redis.xreadgroup(
      "GROUP", groupName, consumerName,
      "COUNT", count,
      "STREAMS", streamKey, ">"
    );
  }

  async readFromStart(streamKey: string, start = "0"): Promise<any> {
    return await this.redis.xread("STREAMS", streamKey, start);
  }

  async acknowledgeMessage(streamKey: string, groupName: string, messageId: string): Promise<number> {
    return await this.redis.xack(streamKey, groupName, messageId);
  }

  async getStreamInfo(streamKey: string): Promise<any> {
    try {
      return await this.redis.xinfo("STREAM", streamKey);
    } catch (error) {
      return null;
    }
  }

  async deleteStream(streamKey: string): Promise<number> {
    return await this.redis.del(streamKey);
  }

  async cleanupOldStreams(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    const keys = await this.redis.keys('stream:*');
    const now = Date.now();
    
    for (const key of keys) {
      const info = await this.getStreamInfo(key);
      if (!info) continue;
      
      const lastActivityId = info['last-generated-id'];
      if (!lastActivityId) continue;
      
      // Parse timestamp from Redis stream ID
      const timestamp = parseInt(lastActivityId.split('-')[0]);
      
      if (now - timestamp > maxAgeMs) {
        await this.deleteStream(key);
      }
    }
  }
}

export const streamManager = new RedisStreamManager();