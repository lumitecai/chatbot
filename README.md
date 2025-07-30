# AI Chat Interface

A modern, responsive chat interface built with React, TypeScript, and Tailwind CSS. Features real-time messaging, conversation management, and contextual AI assistance.

## Features

- **Modern Chat Interface**: Clean, intuitive messaging UI with real-time updates
- **Conversation Management**: Create, switch between, and delete conversations
- **Dark/Light Theme**: Automatic theme switching with persistent preferences
- **Quick Actions**: Pre-defined prompts for common tasks (Code Review, Summarize, Brainstorm)
- **Suggested Actions**: Context-aware follow-up suggestions based on conversation
- **Responsive Design**: Fully mobile-optimized with collapsible sidebar
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom theme

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatbot-demo3
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
REACT_APP_API_BASE_URL=http://localhost:5678
```

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`.

## API Integration

The application is designed to integrate with an n8n backend that provides two endpoints:

### 1. Chat Completion Endpoint
- **URL**: `POST /api/chat/completion`
- **Purpose**: Process user messages and return AI responses
- **Response Time**: <2 seconds

### 2. Suggested Actions Endpoint
- **URL**: `POST /api/chat/suggestions`
- **Purpose**: Analyze conversation context and return relevant suggestions
- **Response Time**: <500ms

## Project Structure

```
src/
├── components/
│   ├── chat/           # Chat interface components
│   ├── sidebar/        # Conversation sidebar components
│   ├── actions/        # Quick and suggested actions
│   └── common/         # Shared components (Header, ThemeToggle)
├── contexts/           # React contexts (Theme, Conversation)
├── hooks/              # Custom React hooks
├── services/           # API and storage services
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Available Scripts

- `npm start` - Run the development server
- `npm build` - Build for production
- `npm test` - Run tests

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **CRACO**: Configuration override for Create React App
- **Axios**: HTTP client
- **Lucide React**: Icons
- **shadcn/ui**: Component patterns

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Response times: <100ms for UI interactions
- Efficient memory management for long conversations
- Optimized re-renders with React.memo where applicable

## Future Enhancements

- File upload with preview
- Voice message support
- Message search functionality
- Multi-language support
- Real-time streaming responses