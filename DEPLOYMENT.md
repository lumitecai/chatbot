# Deployment Guide for Coolify

This guide covers deploying the AI Chatbot application to Coolify.

## Prerequisites

1. A Coolify instance set up and running
2. GitHub repository connected to Coolify
3. n8n instance with the chat webhook configured

## Environment Variables

Set the following environment variables in your Coolify application settings:

```
REACT_APP_N8N_WEBHOOK_URL=https://lumitecai-u40468.vm.elestio.app/webhook/chat-webhook
REACT_APP_N8N_TEST_WEBHOOK_URL=https://lumitecai-u40468.vm.elestio.app/webhook-test/chat-webhook
REACT_APP_API_BASE_URL=https://lumitecai-u40468.vm.elestio.app/webhook/chat-webhook
```

These are the same values used in development and are ready for production use.

## Deployment Configuration

### Build Configuration

- **Dockerfile Path**: `/Dockerfile`
- **Build Target**: `production` (for optimized production build)
- **Port**: `80` (nginx default)

### Build Command (if not using Docker)

```bash
npm ci && npm run build
```

### Start Command (if not using Docker)

You'll need to serve the built files with a static server.

## Login Credentials

Default login credentials:
- **Username**: `admin321`
- **Password**: `erabot2025`

⚠️ **Important**: These are hardcoded credentials. For production use, consider implementing a proper authentication system with secure credential storage.

## Post-Deployment Steps

1. Verify the application is accessible at your configured domain
2. Test the login functionality
3. Ensure the n8n webhook is properly connected by sending a test message
4. Check browser console for any errors

## Troubleshooting

### Common Issues

1. **Blank page after deployment**
   - Check that environment variables are properly set
   - Verify the build completed successfully
   - Check browser console for errors

2. **API/Webhook not working**
   - Ensure CORS is properly configured on your n8n instance
   - Verify the webhook URL is correct and accessible
   - Check network tab in browser developer tools

3. **Login not working**
   - Clear browser localStorage and cookies
   - Verify you're using the correct credentials

## Security Considerations

1. Use HTTPS for production deployments
2. Configure proper CORS settings on your n8n instance
3. Consider implementing environment-based authentication credentials
4. Set up rate limiting on your n8n webhook

## Monitoring

- Monitor application logs in Coolify
- Set up uptime monitoring for your deployed URL
- Monitor n8n webhook execution logs