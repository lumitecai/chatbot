# Docker Setup for Chatbot Demo

This project is fully containerized for development, testing, and production environments.

## Quick Start

### Development
```bash
# Start development server (with hot reload)
npm run docker:dev

# Or manually:
docker run -d --name chatbot-demo3-dev -p 3000:3000 -v $(pwd):/app -v /app/node_modules --env-file .env chatbot-demo3:dev
```

Access the app at http://localhost:3000

### Testing
```bash
# Run tests in Docker
npm run docker:test
```

### Production Build
```bash
# Build production image
npm run docker:build

# Run production preview
npm run docker:prod
```

Access production build at http://localhost:8080

## Docker Commands

- `npm run docker:dev` - Start development server
- `npm run docker:test` - Run tests
- `npm run docker:build` - Build production assets
- `npm run docker:prod` - Run production preview
- `npm run docker:stop` - Stop all containers
- `npm run docker:clean` - Remove containers and images

## Environment Variables

The `.env` file is automatically loaded in Docker. Key variables:
- `REACT_APP_N8N_WEBHOOK_URL` - Production n8n webhook
- `REACT_APP_API_BASE_URL` - API base URL

## Multi-Stage Build

The Dockerfile uses multi-stage builds:
1. **development** - Hot reload development
2. **test** - Run tests
3. **build** - Build production assets
4. **production** - Nginx server for production

## Volumes

Development mode mounts the source code for hot reload:
- `./:/app` - Source code
- `/app/node_modules` - Isolated node_modules