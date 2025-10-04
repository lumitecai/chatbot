# AI Chat Interface

A modern, responsive chat interface built with React, TypeScript, and Tailwind CSS. Features real-time messaging with n8n webhook integration, conversation management, and contextual AI assistance.

## Features

- 🔐 **Authentication**: Simple login system to protect access
- 💬 **Modern Chat Interface**: Clean, intuitive messaging UI with real-time updates
- 📁 **Conversation Management**: Create, switch between, and delete conversations
- 🌓 **Dark/Light Theme**: Automatic theme switching with persistent preferences
- ⚡ **Quick Actions**: Pre-defined prompts for common tasks (Code Review, Summarize, Brainstorm)
- 💡 **Suggested Actions**: Context-aware follow-up suggestions based on conversation
- 📋 **Copy Messages**: Easy copy-to-clipboard functionality for AI responses
- 📱 **Responsive Design**: Fully mobile-optimized with collapsible sidebar
- 🔷 **TypeScript**: Full type safety throughout the application
- 🎨 **Tailwind CSS**: Utility-first styling with custom theme
- 🐳 **Docker Support**: Easy deployment with Docker and Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+ and npm (for local development)
- Docker and Docker Compose (for containerized deployment)
- n8n instance with webhook configured

### Quick Start with Docker (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/lumitecai/chatbot.git
cd chatbot
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start with Docker Compose:
```bash
docker-compose up
```

The app will be available at `http://localhost:3000`.

Default login credentials:
- Username: `admin321`
- Password: `erabot2025`

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm start
```

## Production Deployment

### Using Docker Compose

1. Use the production compose file:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

2. Or use the deployment script:
```bash
./deploy-prod.sh
```

### Using Dockerfile (for Coolify, etc.)

Build target: `production`
Port: `3000`

```bash
docker build --target production -t chatbot-prod .
docker run -p 3000:3000 --env-file .env chatbot-prod
```

## API Integration

The application integrates with n8n webhooks:

### Chat Webhook
- **URL**: Configured in `REACT_APP_N8N_WEBHOOK_URL`
- **Method**: POST
- **Purpose**: Process user messages and return AI responses

Expected response format:
```json
{
  "message": "user input",
  "response": "AI response with **markdown** support",
  "conversationId": "conv-123",
  "messageId": "msg-456",
  "timestamp": "2024-01-30T12:00:00Z"
}
```

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat interface components
│   ├── sidebar/        # Conversation sidebar components
│   ├── actions/        # Quick and suggested actions
│   └── common/         # Shared components (Header, ThemeToggle)
├── contexts/           # React contexts (Theme, Conversation, Auth)
├── hooks/              # Custom React hooks
├── services/           # API and storage services
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Available Scripts

- `npm start` - Run the development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run docker:dev` - Start development with Docker
- `npm run docker:prod` - Start production with Docker
- `npm run docker:stop` - Stop Docker containers

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_N8N_WEBHOOK_URL` | n8n webhook endpoint | `https://n8n.example.com/webhook/chat` |
| `REACT_APP_API_BASE_URL` | API base URL (usually same as webhook) | `https://n8n.example.com/webhook/chat` |

## Technology Stack

- **React 19**: Latest UI framework
- **TypeScript 4.9**: Type safety
- **Tailwind CSS 3.4**: Utility-first styling
- **n8n Integration**: Webhook-based AI responses
- **Docker**: Containerization
- **Nginx**: Production web server
- **Axios**: HTTP client
- **Lucide React**: Modern icons

## Security Notes

⚠️ **Important**: The current authentication uses hardcoded credentials. For production use:
1. Implement proper authentication with a backend service
2. Use environment variables for sensitive data
3. Enable HTTPS
4. Configure CORS properly on your n8n instance

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.