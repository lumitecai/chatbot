#!/bin/bash

# Production deployment script for AI Chatbot

set -e  # Exit on error

echo "🚀 Starting production deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required environment variables:"
    echo "  REACT_APP_N8N_WEBHOOK_URL"
    echo "  REACT_APP_API_BASE_URL"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Pull latest changes (optional - comment out if deploying from local)
# echo "📥 Pulling latest changes from git..."
# git pull origin main

# Build and start production containers
echo "🏗️  Building production Docker image..."
docker-compose -f docker-compose.prod.yml build

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "🚀 Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for container to be healthy
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check if container is running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running at http://localhost:3000"
    
    # Show container logs
    echo ""
    echo "📋 Recent logs:"
    docker-compose -f docker-compose.prod.yml logs --tail 20
else
    echo "❌ Deployment failed! Check logs with:"
    echo "docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Optional: Clean up old images
echo ""
echo "🧹 Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "✨ Production deployment complete!"
echo ""
echo "Useful commands:"
echo "  View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop app:     docker-compose -f docker-compose.prod.yml down"
echo "  Restart app:  docker-compose -f docker-compose.prod.yml restart"