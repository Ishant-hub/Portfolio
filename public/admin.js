document.addEventListener('DOMContentLoaded', () => {
  const authOverlay = document.getElementById('authOverlay');
  const authForm = document.getElementById('authForm');
  const adminPasswordInput = document.getElementById('adminPassword');
  const authError = document.getElementById('authError');
  const dashboardContent = document.getElementById('dashboardContent');
  
  const searchInput = document.getElementById('searchInput');
  const messageCountEl = document.getElementById('messageCount');
  const tableBody = document.getElementById('messagesTableBody');
  const emptyState = document.getElementById('emptyState');
  const messagesTable = document.getElementById('messagesTable');
  
  const logoutBtn = document.getElementById('logoutBtn');
  
  let allMessages = [];
  let authToken = localStorage.getItem('ishant_admin_token') || '';

  // Initial Auth Check
  if (authToken) {
    verifyAndLoad(authToken);
  } else {
    showLogin();
  }

  // Handle Login Form Submit
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = adminPasswordInput.value.trim();
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        authToken = result.token;
        localStorage.setItem('ishant_admin_token', authToken);
        hideLogin();
        loadMessages();
      } else {
        showAuthError(result.error || 'Incorrect passcode.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      showAuthError('Connection error. Please try again.');
    }
  });

  // Verify and Load if token exists
  async function verifyAndLoad(token) {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: token })
      });
      
      if (response.ok) {
        hideLogin();
        loadMessages();
      } else {
        localStorage.removeItem('ishant_admin_token');
        showLogin();
      }
    } catch (err) {
      console.error('Error auto-verifying token:', err);
      showLogin(); // Fallback to login
    }
  }

  // Load Messages from API
  async function loadMessages() {
    try {
      const response = await fetch(`/api/messages?token=${authToken}`);
      if (response.status === 401) {
        logout();
        return;
      }
      
      allMessages = await response.json();
      renderMessages(allMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      alert('Failed to load messages from the server.');
    }
  }

  // Render Messages Table
  function renderMessages(messages) {
    tableBody.innerHTML = '';
    
    if (messages.length === 0) {
      messagesTable.classList.add('hidden');
      emptyState.classList.remove('hidden');
      messageCountEl.textContent = '0 submissions';
      return;
    }

    messagesTable.classList.remove('hidden');
    emptyState.classList.add('hidden');
    messageCountEl.textContent = `${messages.length} submission${messages.length === 1 ? '' : 's'}`;

    messages.forEach(msg => {
      const tr = document.createElement('tr');
      
      // Format Date
      const date = new Date(msg.createdAt);
      const formattedDate = date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      tr.innerHTML = `
        <td><span class="msg-date">${formattedDate}</span></td>
        <td><strong>${escapeHTML(msg.firstName)} ${escapeHTML(msg.lastName)}</strong></td>
        <td><a href="mailto:${escapeHTML(msg.email)}" class="msg-email">${escapeHTML(msg.email)}</a></td>
        <td><div class="msg-text">${escapeHTML(msg.message)}</div></td>
        <td><button class="delete-msg-btn" data-id="${msg.id}">Delete</button></td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach delete handlers
    document.querySelectorAll('.delete-msg-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        deleteMessage(id);
      });
    });
  }

  // Delete message
  async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${id}?token=${authToken}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove locally and re-render
        allMessages = allMessages.filter(msg => msg.id !== id);
        renderMessages(allMessages);
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete message.');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      alert('Network error. Could not delete message.');
    }
  }

  // Search Filter
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
      renderMessages(allMessages);
      return;
    }

    const filtered = allMessages.filter(msg => {
      return (
        msg.firstName.toLowerCase().includes(query) ||
        msg.lastName.toLowerCase().includes(query) ||
        msg.email.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query)
      );
    });

    renderMessages(filtered);
  });

  // Logout
  logoutBtn.addEventListener('click', logout);

  function logout() {
    localStorage.removeItem('ishant_admin_token');
    authToken = '';
    showLogin();
  }

  // View helpers
  function showLogin() {
    authOverlay.classList.remove('hidden');
    dashboardContent.classList.add('hidden');
    adminPasswordInput.value = '';
    authError.style.display = 'none';
  }

  function hideLogin() {
    authOverlay.classList.add('hidden');
    dashboardContent.classList.remove('hidden');
  }

  function showAuthError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
    adminPasswordInput.value = '';
    adminPasswordInput.focus();
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
