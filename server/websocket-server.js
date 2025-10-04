const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store active connections by conversationId
const connections = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connections: connections.size,
    timestamp: new Date().toISOString()
  });
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const conversationId = url.searchParams.get('conversationId');
  
  if (!conversationId) {
    ws.close(1008, 'Missing conversationId');
    return;
  }

  console.log(`WebSocket connected for conversation: ${conversationId}`);
  
  // Store connection
  connections.set(conversationId, ws);
  
  // Set up ping/pong for connection health
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  ws.on('close', () => {
    console.log(`WebSocket disconnected for conversation: ${conversationId}`);
    connections.delete(conversationId);
  });
  
  ws.on('error', (error) => {
    console.error(`WebSocket error for ${conversationId}:`, error.message);
  });
  
  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    conversationId,
    timestamp: new Date().toISOString()
  }));
});

// HTTP endpoint for n8n to send status updates
app.post('/status/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const { status, message, progress, metadata } = req.body;
  
  console.log(`Status update for ${conversationId}:`, { status, message, progress });
  
  const ws = connections.get(conversationId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify({
        type: 'status',
        status,
        message,
        progress,
        metadata,
        timestamp: new Date().toISOString()
      }));
      console.log(`Status sent to ${conversationId}`);
    } catch (error) {
      console.error(`Failed to send status to ${conversationId}:`, error.message);
    }
  } else {
    console.log(`No active connection for ${conversationId}`);
  }
  
  // Fire & forget - always return success
  res.status(200).json({ success: true });
});

// Ping all connections every 30 seconds
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      console.log('Terminating dead connection');
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});