import { Message, SuggestedAction } from '@/types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function generateConversationTitle(firstMessage: string): string {
  const cleanedMessage = firstMessage.trim();
  const maxLength = 50;
  
  if (cleanedMessage.length <= maxLength) {
    return cleanedMessage;
  }
  
  // Try to cut at a word boundary
  const truncated = cleanedMessage.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
}

export function categorizeMessage(message: string): 'code' | 'explanation' | 'help' | 'general' {
  const lowerMessage = message.toLowerCase();
  
  // Code-related keywords
  const codeKeywords = ['code', 'function', 'class', 'variable', 'debug', 'error', 'implement', 'algorithm', 'syntax', 'compile', 'runtime'];
  if (codeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'code';
  }
  
  // Explanation request keywords
  const explanationKeywords = ['explain', 'what is', 'how does', 'why', 'tell me about', 'describe', 'understand'];
  if (explanationKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'explanation';
  }
  
  // Help request keywords
  const helpKeywords = ['help', 'how to', 'guide', 'tutorial', 'steps', 'process', 'setup', 'configure'];
  if (helpKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'help';
  }
  
  return 'general';
}

export function generateContextualSuggestions(
  lastMessage: string,
  conversationContext: Message[]
): SuggestedAction[] {
  const category = categorizeMessage(lastMessage);
  const suggestions: SuggestedAction[] = [];
  
  switch (category) {
    case 'code':
      suggestions.push(
        {
          id: generateId(),
          text: 'Show me the documentation for this',
          category: 'code',
          priority: 1,
        },
        {
          id: generateId(),
          text: 'How can I optimize this code?',
          category: 'code',
          priority: 2,
        },
        {
          id: generateId(),
          text: 'What are common errors with this approach?',
          category: 'code',
          priority: 3,
        }
      );
      break;
      
    case 'explanation':
      suggestions.push(
        {
          id: generateId(),
          text: 'Can you provide a real-world example?',
          category: 'explanation',
          priority: 1,
        },
        {
          id: generateId(),
          text: 'How does this compare to alternatives?',
          category: 'explanation',
          priority: 2,
        },
        {
          id: generateId(),
          text: 'What are the pros and cons?',
          category: 'explanation',
          priority: 3,
        }
      );
      break;
      
    case 'help':
      suggestions.push(
        {
          id: generateId(),
          text: 'Can you break this down step-by-step?',
          category: 'help',
          priority: 1,
        },
        {
          id: generateId(),
          text: 'What tools or resources do I need?',
          category: 'help',
          priority: 2,
        },
        {
          id: generateId(),
          text: 'What are common mistakes to avoid?',
          category: 'help',
          priority: 3,
        }
      );
      break;
      
    default:
      suggestions.push(
        {
          id: generateId(),
          text: 'Tell me more about this',
          category: 'general',
          priority: 1,
        },
        {
          id: generateId(),
          text: 'What else should I know?',
          category: 'general',
          priority: 2,
        },
        {
          id: generateId(),
          text: 'Can you elaborate on that?',
          category: 'general',
          priority: 3,
        }
      );
  }
  
  return suggestions;
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
}