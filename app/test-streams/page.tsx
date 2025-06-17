'use client';

import { useState } from 'react';
import { StreamRecovery } from '@/components/stream-recovery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function TestStreamsPage() {
  const [redisTest, setRedisTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRedisConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-redis');
      const data = await response.json();
      setRedisTest(data);
    } catch (error) {
      setRedisTest({ error: 'Failed to test Redis connection' });
    } finally {
      setLoading(false);
    }
  };

  const startTestStream = async () => {
    try {
      const response = await fetch('/api/test-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt for resumable streams' }),
      });
      const data = await response.json();
      if (data.sessionId) {
        alert(`Test stream started! Session ID: ${data.sessionId}\n\nYou can now test the resumable streams interface below.`);
      }
    } catch (error) {
      alert('Failed to start test stream');
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Resumable Streams Test Page</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test the complete resumable streams implementation with Redis persistence, 
          multi-device access, and background generation.
        </p>
      </div>

      {/* Redis Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle>Redis Connection Test</CardTitle>
          <CardDescription>
            Verify that Upstash Redis is properly connected and data persistence is working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testRedisConnection} disabled={loading}>
                {loading ? 'Testing...' : 'Test Redis Connection'}
              </Button>
              <Button onClick={startTestStream} variant="outline">
                Start Test Stream
              </Button>
            </div>
            
            {redisTest && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  {redisTest.success ? (
                    <Badge className="bg-green-500">Connected ✓</Badge>
                  ) : (
                    <Badge variant="destructive">Failed ✗</Badge>
                  )}
                </div>
                
                {redisTest.test && (
                  <div className="space-y-1 text-sm">
                    <div>Chunks Stored: {redisTest.test.totalChunks}</div>
                    <div>Metadata: {redisTest.test.metadata ? '✓' : '✗'}</div>
                    <div>Status: {redisTest.test.status ? '✓' : '✗'}</div>
                  </div>
                )}
                
                {redisTest.error && (
                  <div className="text-destructive text-sm">
                    Error: {redisTest.error}
                  </div>
                )}
                
                <details className="text-xs">
                  <summary className="cursor-pointer">View Raw Response</summary>
                  <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                    {JSON.stringify(redisTest, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Main Resumable Streams Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Resumable Streams Interface</CardTitle>
          <CardDescription>
            Complete implementation with Redis persistence and multi-device support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StreamRecovery />
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">1. Test Basic Streaming:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Enter a prompt and start a stream</li>
              <li>Watch the real-time generation</li>
              <li>Note the session ID for later tests</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">2. Test Resumability:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Start a stream, let it generate a few chunks</li>
              <li>Refresh the page during generation</li>
              <li>Use the session ID to resume - should continue from where it left off</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">3. Test Multi-Device Access:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Start a stream on this device</li>
              <li>Copy the session ID</li>
              <li>Open this page on another device/browser</li>
              <li>Use the session ID to view the same stream</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">4. Test Background Generation:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Start a stream and immediately close the browser</li>
              <li>Wait a few minutes</li>
              <li>Reopen and resume the stream - generation should have continued</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}