// Simulate n8n workflow sending fire & forget status updates
const conversationId = '1753955715567-ovu9belc6';
const statusServerUrl = 'http://localhost:3001';

// Helper function to send status (fire & forget)
const sendStatus = (status, message, progress, metadata = {}) => {
  fetch(`${statusServerUrl}/status/${conversationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, message, progress, metadata })
  }).catch(() => {}); // Fire & forget - ignore errors
};

console.log('Starting n8n workflow simulation...');

// Workflow start
sendStatus('started', 'Received your message!', 10);

// Simulate processing steps with delays
setTimeout(() => {
  sendStatus('processing', 'Analyzing your request...', 30);
}, 1000);

setTimeout(() => {
  sendStatus('api-call', 'Calling AI model...', 60, { model: 'gpt-4' });
}, 2000);

setTimeout(() => {
  sendStatus('analyzing', 'Processing AI response...', 80);
}, 3000);

setTimeout(() => {
  sendStatus('completed', 'Request completed successfully!', 100, { 
    duration: 4000,
    success: true 
  });
}, 4000);

// Simulate error scenario after 6 seconds
setTimeout(() => {
  console.log('\nSimulating error scenario...');
  sendStatus('error', 'An error occurred during processing', 0, {
    error: 'Simulated error',
    retryable: true
  });
}, 6000);