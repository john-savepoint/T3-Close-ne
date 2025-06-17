'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface StreamChunk {
  type: 'chunk' | 'complete' | 'error' | 'connected' | 'metadata' | 'timeout';
  content?: string;
  error?: string;
  message?: string;
  index?: string;
  timestamp?: string;
  sessionId?: string;
  metadata?: {
    model?: string;
    usage?: any;
    sessionId?: string;
  };
}

interface StreamProgress {
  totalChunks: number;
  status: string;
}

interface StreamSession {
  id: string;
  prompt: string;
  model: string;
  createdAt: number;
  status: 'generating' | 'completed' | 'error';
  totalChunks?: number;
}

interface UseResumableStreamOptions {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export function useResumableStream(options: UseResumableStreamOptions = {}) {
  const {
    autoReconnect = true,
    maxReconnectAttempts = 3,
    reconnectDelay = 2000
  } = options;

  const [content, setContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<StreamProgress | null>(null);
  const [sessionInfo, setSessionInfo] = useState<StreamSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnecting = useRef(false);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connectToStream = useCallback((streamSessionId: string, isReconnection = false) => {
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      return; // Already connected
    }

    cleanup();
    
    if (!isReconnection) {
      setError(null);
      setIsStreaming(true);
      isReconnecting.current = false;
    }

    try {
      const eventSource = new EventSource(`/api/streams/${streamSessionId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        isReconnecting.current = false;
        
        if (isReconnection) {
          console.log('Reconnected to stream');
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data: StreamChunk = JSON.parse(event.data);
          
          switch (data.type) {
            case 'connected':
              setIsConnected(true);
              console.log('Connected to stream:', data.sessionId);
              break;
              
            case 'metadata':
              // Handle metadata (session info)
              break;
              
            case 'chunk':
              if (data.content) {
                setContent(prev => prev + data.content);
              }
              break;
              
            case 'complete':
              setIsStreaming(false);
              setIsConnected(false);
              eventSource.close();
              console.log('Stream completed');
              break;
              
            case 'error':
              setError(data.error || 'Stream error occurred');
              setIsStreaming(false);
              setIsConnected(false);
              eventSource.close();
              break;
              
            case 'timeout':
              setError(data.message || 'Stream timeout');
              setIsStreaming(false);
              setIsConnected(false);
              eventSource.close();
              break;
          }
        } catch (parseError) {
          console.error('Error parsing stream data:', parseError);
        }
      };

      eventSource.onerror = (errorEvent) => {
        console.error('EventSource error:', errorEvent);
        setIsConnected(false);
        
        if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts && !isReconnecting.current) {
          isReconnecting.current = true;
          reconnectAttempts.current++;
          
          console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToStream(streamSessionId, true);
          }, reconnectDelay * reconnectAttempts.current);
        } else {
          setError('Connection lost and max reconnection attempts exceeded');
          setIsStreaming(false);
          eventSource.close();
        }
      };

    } catch (connectionError) {
      console.error('Failed to connect to stream:', connectionError);
      setError('Failed to establish stream connection');
      setIsStreaming(false);
    }
  }, [autoReconnect, maxReconnectAttempts, reconnectDelay, cleanup]);

  const startStream = useCallback(async (
    prompt: string, 
    model: string = 'openai/gpt-4o-mini'
  ): Promise<string | null> => {
    try {
      setContent('');
      setError(null);
      
      const response = await fetch('/api/streams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start stream');
      }

      const { sessionId: newSessionId } = await response.json();
      setSessionId(newSessionId);
      
      // Start connecting to the stream
      connectToStream(newSessionId);
      
      return newSessionId;
    } catch (streamError) {
      const errorMessage = streamError instanceof Error ? streamError.message : 'Unknown error';
      setError(errorMessage);
      setIsStreaming(false);
      return null;
    }
  }, [connectToStream]);

  const resumeStream = useCallback((streamSessionId: string) => {
    setSessionId(streamSessionId);
    setContent(''); // Reset content - it will be rebuilt from Redis
    setError(null);
    setIsStreaming(true);
    connectToStream(streamSessionId);
  }, [connectToStream]);

  const getStreamInfo = useCallback(async (streamSessionId?: string): Promise<StreamSession | null> => {
    const targetSessionId = streamSessionId || sessionId;
    if (!targetSessionId) return null;

    try {
      const response = await fetch(`/api/streams/generate?sessionId=${targetSessionId}`);
      if (!response.ok) return null;

      const data = await response.json();
      const info = data.session;
      setSessionInfo(info);
      setProgress(data.progress);
      return info;
    } catch {
      return null;
    }
  }, [sessionId]);

  const stopStream = useCallback(async () => {
    cleanup();
    setIsStreaming(false);
    
    if (sessionId) {
      try {
        await fetch(`/api/streams/${sessionId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error stopping stream:', error);
      }
    }
  }, [cleanup, sessionId]);

  const clearContent = useCallback(() => {
    setContent('');
    setError(null);
    setProgress(null);
    setSessionInfo(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // State
    content,
    isStreaming,
    error,
    sessionId,
    progress,
    sessionInfo,
    isConnected,
    isReconnecting: isReconnecting.current,
    reconnectAttempts: reconnectAttempts.current,
    
    // Actions
    startStream,
    resumeStream,
    stopStream,
    getStreamInfo,
    clearContent,
  };
}