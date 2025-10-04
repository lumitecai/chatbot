/**
 * Streaming API service for n8n webhook integration
 * Uses native fetch API with ReadableStream support
 */

import { StreamBuffer } from '@/utils/streamParsers';
import { sessionManager } from './session';

export interface StreamingOptions {
  onChunk?: (content: string) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export interface StreamingRequest {
  message: string;
  conversationId: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Send a streaming request to n8n webhook
 */
export async function sendStreamingMessage(
  request: StreamingRequest,
  options: StreamingOptions = {}
): Promise<string> {
  const { onChunk, onComplete, onError, signal } = options;

  // Get session and webhook URL
  const session = sessionManager.getSession();
  const webhookUrl = session?.webhookUrl || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5678';
  const sessionId = session?.sessionId || request.sessionId;
  const userId = session?.userId || request.userId;

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  if (userId) {
    headers['x-user-id'] = userId;
  }

  // Get user info from localStorage for user context
  let userInfo = null;
  try {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      userInfo = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn('Failed to parse user info:', error);
  }

  // Get user's language preference
  const userLanguage = localStorage.getItem('i18nextLng') || 'en';

  // Prepare payload with user context
  const payload: any = {
    message: request.message,
    conversationId: request.conversationId,
    language: userLanguage, // Include language preference for n8n
  };

  // Add user context if available - send complete user object including groups and extended profile
  if (userInfo) {
    payload.user = userInfo;
  }

  let fullContent = '';
  const streamBuffer = new StreamBuffer();

  try {
    // Make fetch request
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Always treat as streaming - n8n sends application/json but streams the response
    if (!response.body) {
      throw new Error('No response body received');
    }

    // Process streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Flush any remaining buffer content
          const finalChunks = streamBuffer.flush();
          for (const content of finalChunks) {
            fullContent += content;
            if (onChunk) {
              onChunk(content);
            }
          }
          break;
        }

        // Decode chunk
        const text = decoder.decode(value, { stream: true });

        // Process chunk through buffer
        const contentChunks = streamBuffer.processChunk(text);

        // Emit each content chunk
        for (const content of contentChunks) {
          fullContent += content;
          if (onChunk) {
            onChunk(content);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Refresh session
    sessionManager.refreshSession();

    if (onComplete) {
      onComplete(fullContent);
    }

    return fullContent;

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (onError) {
      onError(err);
    }

    throw err;
  }
}

/**
 * Cancel a streaming request using AbortController
 */
export function createStreamController(): AbortController {
  return new AbortController();
}
