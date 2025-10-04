/**
 * Simple test script to verify n8n streaming integration
 */

const webhookUrl = 'https://lumitecai-u40468.vm.elestio.app/webhook/eed0034b-9107-43a9-bd2f-8901217c7e5c';

async function testStreaming() {
  console.log('🧪 Testing n8n streaming webhook...\n');
  console.log('URL:', webhookUrl);
  console.log('\n--- Sending request ---\n');

  const payload = {
    message: 'Tell me a short joke',
    conversationId: 'test-' + Date.now(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Connection successful!');
    console.log('Content-Type:', response.headers.get('Content-Type'));
    console.log('\n--- Streaming response ---\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process remaining buffer
        if (buffer.trim()) {
          console.log('\n[Final buffer]:', buffer);
        }
        break;
      }

      const text = decoder.decode(value, { stream: true });
      buffer += text;

      // Process line by line
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const chunk = JSON.parse(line);

          if (chunk.type === 'begin') {
            console.log('🎬 Stream started');
          } else if (chunk.type === 'item' && chunk.content) {
            process.stdout.write(chunk.content);
            fullContent += chunk.content;
          } else if (chunk.type === 'end') {
            console.log('\n\n🏁 Stream ended');
          } else if (chunk.type === 'error') {
            console.error('\n❌ Error chunk:', chunk);
          }
        } catch (e) {
          console.log('\n[Non-JSON line]:', line);
        }
      }
    }

    console.log('\n\n--- Summary ---');
    console.log('Full response length:', fullContent.length, 'characters');
    console.log('Full response:', fullContent);
    console.log('\n✅ Streaming test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testStreaming();
