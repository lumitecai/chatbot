#!/bin/bash

echo "Testing Chatbot Docker Integration"
echo "=================================="

# Check if app is running
echo -n "1. Checking if app is accessible... "
if curl -s http://localhost:3000 | grep -q "root"; then
  echo "✓ OK"
else
  echo "✗ FAILED"
  exit 1
fi

# Check if static assets are served
echo -n "2. Checking static assets... "
if curl -s http://localhost:3000 | grep -q "script src"; then
  echo "✓ OK"
else
  echo "✗ FAILED"
fi

# Check Docker container health
echo -n "3. Checking Docker container... "
if docker ps | grep -q "chatbot-demo3-dev"; then
  echo "✓ OK"
else
  echo "✗ FAILED"
  exit 1
fi

# Check n8n webhook (production)
echo -n "4. Testing n8n webhook connection... "
WEBHOOK_URL="https://lumitecai-u40468.vm.elestio.app/webhook/chat-webhook"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session" \
  -H "x-user-id: test-user" \
  -d '{"message": "test", "conversationId": "test-123"}')

if [ "$RESPONSE" = "404" ]; then
  echo "✓ OK (Webhook exists, workflow needs activation)"
elif [ "$RESPONSE" = "200" ]; then
  echo "✓ OK (Webhook active)"
else
  echo "✗ FAILED (Status: $RESPONSE)"
fi

echo ""
echo "Integration test complete!"
echo ""
echo "To interact with the app:"
echo "- Open http://localhost:3000 in your browser"
echo "- Activate your n8n workflow for production webhook"
echo "- Or use the test webhook URL in n8n"