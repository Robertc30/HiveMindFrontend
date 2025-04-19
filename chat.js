// Connect to the production WebSocket server on Vercel
const socket = new WebSocket('wss://hive-mind-frontend.vercel.app'); // WebSocket server URL

const messagesContainer = document.getElementById('messages');
const input = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// 🔥 Create random username when user connects
const username = `User_${Math.floor(Math.random() * 10000)}`;

sendButton.addEventListener('click', async () => {
  const message = input.value.trim();
  if (message) {
    // Send message via WebSocket (to other users)
    socket.send(JSON.stringify({ username, message }));

    // --- Send message to the backend AI API ---
    // Uses the relative path '/api/chat', assuming it's hosted
    // on the same Vercel deployment as the frontend.
    try {
      // 👇 UPDATED FETCH URL HERE 👇
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }), // Send only the message content
      });
      // 👆 UPDATED FETCH URL HERE 👆

      if (!response.ok) {
        // Handle HTTP errors (like 404, 500)
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Check if the expected 'reply' field exists
      if (data && data.reply) {
          const botMessage = document.createElement('div');
          botMessage.textContent = `🤖 ${data.reply}`;
          messagesContainer.appendChild(botMessage);
          messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll down
      } else {
          console.warn('Received unexpected data format from API:', data);
          // Optionally display a generic error to the user
          const errorMessage = document.createElement('div');
          errorMessage.style.color = 'orange';
          errorMessage.textContent = '🤖 Received an unexpected response from the AI.';
          messagesContainer.appendChild(errorMessage);
      }

    } catch (error) {
      console.error('Error sending message to AI API (/api/chat):', error);
      // Display a user-friendly error message in the chat
      const errorMessage = document.createElement('div');
      errorMessage.style.color = 'red';
      errorMessage.textContent = '🤖 Error connecting to AI service.';
      messagesContainer.appendChild(errorMessage);
      messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll down
    }
    // --- End AI API call section ---

    input.value = ''; // Clear the input field
  }
});

// Allow sending on Enter key
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent adding a newline in the input
    sendButton.click(); // Trigger the send button's click event
  }
});

// Handle incoming messages from WebSocket (other users' messages)
socket.addEventListener('message', (event) => {
  try {
    const payload = JSON.parse(event.data);
    // Ensure the message has the expected structure before displaying
    if (payload && payload.username && payload.message) {
      const userMessage = document.createElement('div');
      // Simple text display (consider sanitizing if messages could contain HTML)
      userMessage.textContent = `${payload.username}: ${payload.message}`;
      messagesContainer.appendChild(userMessage);
      messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
    } else {
      console.warn('Received malformed WebSocket message:', event.data);
    }
  } catch (error) {
    console.error('Error parsing incoming WebSocket message:', error, 'Data:', event.data);
  }
});

// --- WebSocket Connection Status Handling ---
socket.addEventListener('open', () => {
  console.log('WebSocket connected to wss://hive-mind-frontend.vercel.app');
  const statusMessage = document.createElement('div');
  statusMessage.style.fontStyle = 'italic';
  statusMessage.style.color = 'grey';
  statusMessage.textContent = 'Connected to chat.';
  messagesContainer.appendChild(statusMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.addEventListener('close', (event) => {
  console.log('WebSocket closed:', event.code, event.reason);
  const statusMessage = document.createElement('div');
  statusMessage.style.fontStyle = 'italic';
  statusMessage.style.color = 'orange';
  statusMessage.textContent = 'Disconnected from chat.'; // Simpler message for users
  messagesContainer.appendChild(statusMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  // Consider adding automatic reconnection logic here if needed
});

socket.addEventListener('error', (error) => {
  console.error('WebSocket connection error:', error);
  const statusMessage = document.createElement('div');
  statusMessage.style.fontStyle = 'italic';
  statusMessage.style.color = 'red';
  statusMessage.textContent = 'Chat connection error.';
  messagesContainer.appendChild(statusMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});