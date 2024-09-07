export const registerUser = async ({ username, password, email }) => {
  try {
    const response = await fetch(`/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const message = errorText || `Failed to register (status: ${response.status})`;
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in registerUser:", error.message || error);
    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to login (status: ${response.status})`);
    }

    const data = await response.json();
    return data; // This should include { id, username, email, token }
  } catch (error) {
    console.error('Error in loginUser:', error.message || error);
    throw error;
  }
};

export const validateForm = ({ username, email, password }) => {
  if (!username || !email || !password) {
    return "All fields are required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  return ""; // Return empty string if no errors
};

export const verifyToken = async (token) => {
  try {
    const response = await fetch("/api/users/verify-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Failed to verify token (status:", response.status, ")");
      return false;
    }

    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error("Token verification failed:", error.message || error);
    return false;
  }
};

export const fetchUserDetails = async (token) => {
  try {
    const response = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const message = `Failed to fetch user details (status: ${response.status})`;
      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user details:", error.message || error);
    throw error;
  }
};

export const putUserDetails = async (user, token) => {
  try {
    const response = await fetch(`/api/users/update/${user.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      throw new Error(`Error updating user: ${response.statusText}`);
    }

    console.log('User updated:', user);
    return await response.json();
  } catch (error) {
    console.error('Error updating user:', error.message);
    throw error;
  }
}

export const validateMessage = (message) => {
  return message && message.trim() !== '';
};

export const sendMessage = (socket, roomId, message, username) => {
    socket.emit('message', { roomId, message, username });
    console.log('Sending message:', { roomId, message, username });
};

export const fetchMessages = async (roomName, page, showFeedback) => {
  try {
    const response = await fetch(`/api/users/rooms/${roomName}/messages?page=${page}&limit=20`);

    if (!response.ok) {
      console.error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
      showFeedback(`Error: Failed to fetch messages (${response.status})`, 'error');
      return null; // Indicate error
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Received non-JSON response');
      showFeedback('Error: Received invalid response format', 'error');
      return null; // Indicate error
    }

    const newMessages = await response.json();
    return newMessages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    showFeedback('Error: Failed to fetch messages', 'error');
    return null; // Indicate error
  }
};

