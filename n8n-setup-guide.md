# n8n AI Chat Agent Setup Guide

This guide will help you set up the n8n workflow to work with your chat application.

## Prerequisites

- n8n instance (v1.0+ recommended)
- OpenAI API key
- Optional: Tavily API key for web search

## Setup Steps

### 1. Import the Workflow

1. Open your n8n instance
2. Click "Add workflow" → "Import from file"
3. Select `n8n-chat-agent-workflow.json`
4. The workflow will appear in your editor

### 2. Configure Credentials

#### OpenAI Credentials
1. Click on the "OpenAI Chat Model" node
2. Click "Create New" under Credentials
3. Enter your OpenAI API key
4. Save the credentials

#### Optional: Web Search (Tavily)
1. If you want web search capabilities, click the "Web Search Tool" node
2. Add Tavily API credentials
3. Or remove this node if not needed

### 3. Activate the Workflow

1. Click the "Active" toggle in the top bar
2. Copy the webhook URL from the "Webhook" node:
   - Production: `https://your-n8n-domain.com/webhook/chat-webhook`
   - Test: Click "Test Workflow" and use the test URL

### 4. Configure Your Chat App

1. Open the chat application
2. Click the settings icon (⚙️)
3. Paste the webhook URL
4. Optional: Add an API key if you want additional security
5. Click "Save Settings"

## Workflow Features

### AI Agent Node
- Uses GPT-4 Turbo for intelligent responses
- Maintains conversation context
- Supports markdown formatting
- Temperature set to 0.7 for balanced creativity

### Memory Management
- Window Buffer Memory stores last 10 messages
- Session-based memory isolation
- Automatic context management

### Tools Available
- **Web Search**: Search current information when needed
- Easy to add more tools (Calculator, Database, etc.)

### Error Handling
- Graceful error responses
- Proper HTTP status codes
- Detailed error logging

## Testing the Integration

1. Start a new chat in the app
2. Type: "Hello, can you help me?"
3. You should receive a response from the AI
4. Check n8n execution logs for debugging

## Customization Options

### Change the AI Model
In the "OpenAI Chat Model" node:
- `gpt-4-turbo-preview` (default)
- `gpt-4`
- `gpt-3.5-turbo` (faster, cheaper)

### Adjust AI Behavior
In the "AI Agent" node, modify:
- System message for personality
- Temperature (0-1) for creativity
- Max tokens for response length

### Add More Tools
1. Add tool nodes (HTTP Request, Code, etc.)
2. Connect to the AI Agent node's tool input
3. Configure tool descriptions

### Custom Response Format
Modify the "Format Response" node to add:
- Suggested follow-up questions
- Confidence scores
- Source citations
- Custom metadata

## Security Considerations

1. **API Key Protection**: Store credentials securely in n8n
2. **CORS Settings**: Configured to accept requests from any origin (modify for production)
3. **Rate Limiting**: Consider adding rate limiting in n8n or via reverse proxy
4. **Input Validation**: The workflow validates required fields

## Troubleshooting

### No Response
- Check webhook URL is correct
- Verify workflow is active
- Check n8n logs for errors

### Authentication Errors
- Verify OpenAI API key is valid
- Check API usage limits

### Slow Responses
- Normal for GPT-4 (10-20 seconds)
- Consider GPT-3.5-turbo for faster responses
- Check n8n server resources

## Advanced Features

### Session Persistence
The workflow maintains conversation history per session:
```javascript
sessionKey: "={{ $('extract-data').item.json.sessionId }}"
```

### Dynamic System Messages
You can inject user context:
```javascript
systemMessage: "Current session: {{ sessionId }}\nUser: {{ userId }}"
```

### Webhook Response Headers
Custom headers are returned:
- `X-Session-ID`: For session tracking
- Can add more as needed

## Next Steps

1. Test the basic chat functionality
2. Customize the AI personality
3. Add additional tools as needed
4. Implement user authentication
5. Set up monitoring and analytics

## Support

- n8n Documentation: https://docs.n8n.io
- OpenAI API Docs: https://platform.openai.com/docs
- Report issues in the GitHub repository