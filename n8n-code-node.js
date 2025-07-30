// N8N CODE NODE - Use this between "AI Agent" and "Respond to Webhook"
// Mode: Run Once for Each Item
// Language: JavaScript

// Get input data from previous node
const inputData = $input.item.json;

// Extract fields
const message = inputData.message || '';
const aiResponse = inputData.output || inputData.response || '';
const conversationId = inputData.conversationId || '';

// Build response object
const responseData = {
  message: message,
  response: aiResponse,
  conversationId: conversationId,
  messageId: 'msg-' + Date.now(),
  timestamp: new Date().toISOString(),
  metadata: {
    format: 'markdown'
  }
};

// Handle empty AI response
if (!aiResponse) {
  responseData.response = "I apologize, but I couldn't generate a response. Please try again.";
  responseData.metadata.error = true;
}

// Return in n8n format (array of items)
return [{
  json: responseData
}];