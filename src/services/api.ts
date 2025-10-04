import axios from 'axios';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  SuggestionsRequest,
  SuggestionsResponse,
} from '@/types';
import { sessionManager } from './session';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5678';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Request interceptor to add session headers
apiClient.interceptors.request.use(
  (config) => {
    // Add session headers
    const sessionHeaders = sessionManager.getHeaders();
    Object.entries(sessionHeaders).forEach(([key, value]) => {
      config.headers.set(key, value);
    });

    // Use webhook URL if configured
    const session = sessionManager.getSession();
    if (session?.webhookUrl) {
      config.baseURL = session.webhookUrl;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Refresh session on successful response
    sessionManager.refreshSession();
    
    // Handle session updates from response headers
    const newSessionId = response.headers['x-new-session-id'];
    const newApiKey = response.headers['x-new-api-key'];
    
    if (newSessionId || newApiKey) {
      sessionManager.updateSession({
        ...(newSessionId && { sessionId: newSessionId }),
        ...(newApiKey && { apiKey: newApiKey }),
      });
    }
    
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error statuses
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - clearing session');
          sessionManager.clearSession();
          // Could redirect to login here
          break;
        case 429:
          console.error('Rate limit exceeded');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const chatAPI = {
  async sendMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const session = sessionManager.getSession();
      const sessionId = session?.sessionId || request.metadata?.sessionId;
      const userId = session?.userId || request.userId;
      
      // For n8n webhook, send minimal data since n8n handles memory
      const n8nRequest = {
        message: request.message,
        conversationId: request.conversationId,
      };
      
      // Configure headers for n8n
      const headers = {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
        'x-user-id': userId,
      };
      
      // Use the webhook URL directly
      const webhookUrl = session?.webhookUrl || API_BASE_URL;
      const response = await axios.post(
        webhookUrl,
        n8nRequest,
        { headers }
      );
      
      // Transform n8n response to match expected format
      return {
        messageId: `msg-${Date.now()}`,
        response: response.data.response || response.data.message || 'Message received',
        timestamp: new Date().toISOString(),
        conversationId: request.conversationId,
        metadata: response.data.metadata || {},
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getSuggestions(request: SuggestionsRequest): Promise<SuggestionsResponse> {
    try {
      const response = await apiClient.post<SuggestionsResponse>(
        '/api/chat/suggestions',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      // Return default suggestions on error
      return {
        suggestions: [
          {
            id: '1',
            text: 'Tell me more about this',
            category: 'general',
            priority: 1,
          },
          {
            id: '2',
            text: 'Can you provide an example?',
            category: 'explanation',
            priority: 2,
          },
          {
            id: '3',
            text: 'What are the next steps?',
            category: 'help',
            priority: 3,
          },
        ],
        metadata: {
          analysisTime: 0,
          confidence: 0,
          fallbackUsed: true,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

export default apiClient;