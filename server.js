const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'messages.json');
const ADMIN_PASSWORD = 'admin'; // Simple passcode for admin panel demo

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helpers
function readMessages() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading messages database:', err);
    return [];
  }
}

function writeMessages(messages) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to messages database:', err);
    return false;
  }
}

// Authentication middleware for admin API
function checkAuth(req, res, next) {
  const token = req.headers['authorization'] || req.query.token;
  if (token === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Invalid passcode.' });
  }
}

// Routes
// 1. Submit contact message
app.post('/api/contact', (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  // Simple validation
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const messages = readMessages();
  const newMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  messages.push(newMessage);
  if (writeMessages(messages)) {
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } else {
    res.status(500).json({ error: 'Failed to save message. Please try again.' });
  }
});

// 2. Fetch all messages (Admin only)
app.get('/api/messages', checkAuth, (req, res) => {
  const messages = readMessages();
  // Return reversed so newest are first
  res.json(messages.slice().reverse());
});

// 3. Delete a message (Admin only)
app.delete('/api/messages/:id', checkAuth, (req, res) => {
  const { id } = req.params;
  let messages = readMessages();
  const initialLength = messages.length;
  messages = messages.filter(msg => msg.id !== id);

  if (messages.length === initialLength) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  if (writeMessages(messages)) {
    res.json({ success: true, message: 'Message deleted successfully.' });
  } else {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

// 4. Verify auth token
app.post('/api/auth/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Invalid passcode.' });
  }
});

// Fallback to index.html for undefined routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Ishant Sharma Portfolio server is running on http://localhost:${PORT}`);
});
