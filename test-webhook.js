// Test script to verify webhook integration
const axios = require('axios');

async function testWebhook() {
  const webhookUrl = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://lumitecai-u40468.vm.elestio.app/webhook/chat-webhook';
  
  const testData = {
    message: "Hello from Docker test",
    conversationId: "test-conv-123"
  };
  
  const headers = {
    'Content-Type': 'application/json',
    'x-session-id': 'test-session-docker',
    'x-user-id': 'test-user-docker'
  };
  
  console.log('Testing webhook:', webhookUrl);
  console.log('Headers:', headers);
  console.log('Body:', testData);
  
  try {
    const response = await axios.post(webhookUrl, testData, { headers });
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:', response.data);
  } catch (error) {
    console.error('\nError:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testWebhook();