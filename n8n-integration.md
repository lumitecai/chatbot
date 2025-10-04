# n8n Integration Guide

This guide explains how to integrate the AI Chat Interface with n8n webhooks.

## Session Management Strategy

### 1. Session Flow

```
User → Chat UI → Session Manager → n8n Webhook → AI Service
                       ↓
                 Session Storage
```

### 2. Session Headers

Every request to n8n includes these headers:

- `X-Session-ID`: Unique session identifier
- `X-User-ID`: User identifier (persisted across sessions)
- `Authorization`: Bearer token (if API key is configured)
- `Content-Type`: application/json

### 3. Request Format

```json
{
  "message": "User message",
  "conversationId": "conv-123",
  "userId": "user-456",
  "sessionId": "session-789",
  "context": {
    "previousMessages": [...],
    "conversationHistory": [...]
  },
  "metadata": {
    "sessionId": "session-789",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-20T10:30:00Z",
    "sessionMetadata": {
      "createdAt": "2024-01-20T09:00:00Z",
      "platform": "MacIntel"
    }
  }
}
```

## n8n Webhook Setup

### 1. Create Webhook Node

```yaml
Node: Webhook
Method: POST
Path: /chat/completion
Authentication: Header Auth (optional)
```

### 2. Session Validation

Add an IF node to validate session:

```javascript
// Check session headers
const sessionId = $headers['x-session-id'];
const userId = $headers['x-user-id'];
const auth = $headers['authorization'];

// Validate API key if required
if (auth) {
  const apiKey = auth.replace('Bearer ', '');
  // Validate against your API keys
}

return {
  valid: !!sessionId && !!userId,
  sessionId,
  userId
};
```

### 3. Context Management

Store conversation context in n8n:

```javascript
// Store in static data or external DB
const conversations = $getWorkflowStaticData('conversations');
const convId = $json.conversationId;

if (!conversations[convId]) {
  conversations[convId] = {
    messages: [],
    created: new Date().toISOString()
  };
}

// Add message to history
conversations[convId].messages.push({
  role: 'user',
  content: $json.message,
  timestamp: $json.metadata.timestamp
});
```

### 4. AI Integration

Connect to your AI service (OpenAI, Anthropic, etc.):

```javascript
// Prepare context for AI
const context = conversations[convId].messages
  .slice(-10) // Last 10 messages
  .map(m => `${m.role}: ${m.content}`)
  .join('\n');

// Send to AI service
const aiResponse = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: context + '\n\nUser: ' + $json.message }
  ]
});
```

### 5. Response Format

Return response with session updates:

```javascript
return {
  json: {
    response: aiResponse.choices[0].message.content,
    conversationId: convId,
    messageId: generateId(),
    timestamp: new Date().toISOString(),
    metadata: {
      processingTime: Date.now() - startTime,
      model: "gpt-4",
      tokens: aiResponse.usage
    }
  },
  headers: {
    'X-Session-ID': sessionId, // Echo back
    'X-New-Session-ID': newSessionId, // If rotating
    'X-New-API-Key': newApiKey // If updating
  }
};
```

## Security Considerations

### 1. API Key Validation

```javascript
// In n8n webhook node
const validApiKeys = $getWorkflowStaticData('apiKeys');
const providedKey = $headers.authorization?.replace('Bearer ', '');

if (providedKey && !validApiKeys.includes(providedKey)) {
  return {
    statusCode: 401,
    body: { error: 'Unauthorized' }
  };
}
```

### 2. Rate Limiting

```javascript
// Track requests per session
const rateLimits = $getWorkflowStaticData('rateLimits');
const key = `${sessionId}:${Date.now() / 60000 | 0}`; // Per minute

rateLimits[key] = (rateLimits[key] || 0) + 1;

if (rateLimits[key] > 60) { // 60 requests per minute
  return {
    statusCode: 429,
    body: { error: 'Rate limit exceeded' }
  };
}
```

### 3. Session Expiry

```javascript
// Check session age
const sessions = $getWorkflowStaticData('sessions');
const session = sessions[sessionId];

if (session) {
  const age = Date.now() - new Date(session.created).getTime();
  if (age > 24 * 60 * 60 * 1000) { // 24 hours
    delete sessions[sessionId];
    return {
      statusCode: 401,
      body: { error: 'Session expired' }
    };
  }
}
```

## Client Configuration

### 1. Basic Setup (No Auth)

```javascript
// Just use the default endpoint
const response = await fetch('http://localhost:5678/webhook/chat/completion', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId,
    'X-User-ID': userId
  },
  body: JSON.stringify(requestData)
});
```

### 2. With API Key

```javascript
// Configure in Settings modal
{
  apiKey: 'your-secret-key',
  webhookUrl: 'https://your-n8n.com/webhook/abc123'
}
```

### 3. Custom Headers

```javascript
// For additional security
sessionManager.updateSession({
  metadata: {
    customHeaders: {
      'X-Custom-Token': 'special-value',
      'X-Client-Version': '1.0.0'
    }
  }
});
```

## Testing

### 1. Test Webhook

```bash
curl -X POST http://localhost:5678/webhook/chat/completion \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: test-session" \
  -H "X-User-ID: test-user" \
  -d '{
    "message": "Hello",
    "conversationId": "test-conv",
    "userId": "test-user"
  }'
```

### 2. Monitor Sessions

In n8n, add a Debug node to log:
- Active sessions
- Request counts
- Error rates
- Response times

## Best Practices

1. **Session Rotation**: Rotate session IDs periodically for security
2. **Context Pruning**: Limit context to last N messages to control costs
3. **Error Handling**: Always return proper error messages
4. **Logging**: Log all requests for debugging
5. **Caching**: Cache AI responses for repeated queries
6. **Graceful Degradation**: Handle n8n downtime gracefully