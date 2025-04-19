const socket = new WebSocket('ws://localhost:3000');

const messagesContainer = document.getElementById('messages');
const input = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

sendButton.addEventListener('click', async () => {
  const message = input.value.trim();
  input.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form from submitting if any
      sendButton.click(); // Trigger the send button click
    }
  });
  
  if (message) {
    socket.send(message);

    // 🧠 Also send message to backend OpenRouter
    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      console.log('OpenRouter reply:', data.reply);

      // Show bot reply in the chat
      const botMessage = document.createElement('div');
      botMessage.textContent = `🤖 ${data.reply}`;
      messagesContainer.appendChild(botMessage);
    } catch (error) {
      console.error('Error sending to OpenRouter:', error);
    }

    input.value = '';
  }
});

// Handle messages over WebSocket
socket.addEventListener('message', (event) => {
  const userMessage = document.createElement('div');
  userMessage.textContent = event.data;
  messagesContainer.appendChild(userMessage);
});
