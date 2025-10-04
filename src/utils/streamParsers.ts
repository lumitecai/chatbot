/**
 * Utilities for parsing n8n streaming responses
 */

export interface N8NStreamChunk {
  type: 'begin' | 'item' | 'end' | 'error' | 'metadata';
  content?: string;
  metadata?: {
    nodeId?: string;
    nodeName?: string;
    itemIndex?: number;
    runIndex?: number;
    timestamp?: number;
  };
}

/**
 * Parse a single n8n streaming chunk
 * Filters out metadata and control chunks, returns only content
 */
export function parseN8NChunk(chunkText: string): string | null {
  if (!chunkText.trim()) {
    return null;
  }

  try {
    const data: N8NStreamChunk = JSON.parse(chunkText.trim());

    // Skip control chunks (begin, end, metadata, error)
    if (data.type === 'begin' || data.type === 'end' || data.type === 'metadata') {
      return null;
    }

    // Handle error chunks
    if (data.type === 'error') {
      console.error('n8n stream error:', data);
      return null;
    }

    // Extract content from item chunks
    if (data.type === 'item' && data.content) {
      return data.content;
    }

    return null;
  } catch (error) {
    // If not valid JSON, try to extract as plain text
    if (!chunkText.startsWith('{')) {
      return chunkText.trim();
    }
    console.warn('Failed to parse chunk:', chunkText, error);
    return null;
  }
}

/**
 * Process a line-delimited stream of JSON chunks
 * Handles incomplete JSON objects and buffering
 */
export class StreamBuffer {
  private buffer: string = '';

  /**
   * Add data to buffer and extract complete chunks
   */
  processChunk(data: string): string[] {
    this.buffer += data;
    const chunks: string[] = [];

    // Split by newlines to get individual JSON objects
    const lines = this.buffer.split('\n');

    // Keep the last incomplete line in the buffer
    this.buffer = lines.pop() || '';

    // Process complete lines
    for (const line of lines) {
      if (line.trim()) {
        const content = parseN8NChunk(line);
        if (content !== null) {
          chunks.push(content);
        }
      }
    }

    return chunks;
  }

  /**
   * Flush any remaining buffer content
   */
  flush(): string[] {
    if (!this.buffer.trim()) {
      return [];
    }

    const chunks: string[] = [];
    const content = parseN8NChunk(this.buffer);
    if (content !== null) {
      chunks.push(content);
    }

    this.buffer = '';
    return chunks;
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.buffer = '';
  }
}
