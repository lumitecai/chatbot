# WebSocket Status Server

This server provides real-time status updates from n8n workflows to the React app.

## Setup

### Local Development

1. Install dependencies:
```bash
cd server
npm install
```

2. Run the server:
```bash
npm start
# or for development with auto-restart
npm run dev
```

### Docker

Run with Docker Compose:
```bash
docker-compose up websocket-server
```

## Usage in n8n

Add Code nodes in your n8n workflow with fire & forget status updates:

```javascript
// Example: Send processing status
const conversationId = $input.first().json.conversationId;

fetch(`${$env.STATUS_SERVER_URL}/status/${conversationId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'processing',
    message: 'Analyzing your request...',
    progress: 50
  })
}).catch(() => {});

return $input.all();
```

## Environment Variables

- `WS_PORT`: WebSocket server port (default: 3001)
- `STATUS_SERVER_URL`: URL for n8n to send status updates (set in n8n)

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /status/:conversationId` - Send status update for a conversation

## WebSocket Connection

Connect from React app:
```
ws://localhost:3001?conversationId=<conversation-id>
```

## Status Message Format

```json
{
  "type": "status",
  "status": "processing",
  "message": "Processing your request...",
  "progress": 50,
  "metadata": {
    "key": "value"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```