const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();

// CORS configuration - restrict to allowed origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3002', 'https://chatbot.lumitec.ai'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' })); // Limit request size

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store active connections by conversationId
const connections = new Map();

// Rate limiting storage
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// Rate limiting function
function checkRateLimit(identifier) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return true;
}

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, requests] of rateLimitMap.entries()) {
    const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (recentRequests.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, recentRequests);
    }
  }
}, RATE_LIMIT_WINDOW);

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
  const token = url.searchParams.get('token');
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!conversationId) {
    ws.close(1008, 'Missing conversationId');
    return;
  }

  // Basic token validation (in production, validate against session/JWT)
  // For now, just check token exists - can be enhanced later
  if (!token && process.env.NODE_ENV === 'production') {
    console.warn(`WebSocket auth failed for ${conversationId} from ${clientIp}`);
    ws.close(1008, 'Authentication required');
    return;
  }

  // Rate limiting by IP
  if (!checkRateLimit(clientIp)) {
    console.warn(`Rate limit exceeded for ${clientIp}`);
    ws.close(1008, 'Rate limit exceeded');
    return;
  }

  console.log(`WebSocket connected for conversation: ${conversationId} from ${clientIp}`);

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
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Rate limiting for HTTP endpoints
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Input validation
  if (!conversationId || typeof conversationId !== 'string' || conversationId.length > 100) {
    return res.status(400).json({ error: 'Invalid conversationId' });
  }

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