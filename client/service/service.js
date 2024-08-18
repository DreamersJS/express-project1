export const registerUser = async ({ username, password, email }) => {
    try {
      const response = await fetch(`/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to register');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in registerUser:', error.message || error);
      throw error;
    }
  };
  
  
export const loginUser = async (credentials) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
      }
  
      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

export const validateForm = ({ username, email, password }) => {
    if (!username || !email || !password) {
      return 'All fields are required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    return ''; // Return empty string if no errors
  };
  
export const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/users/verify-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };
  
  // Fetch user details with a valid token
  export const fetchUserDetails = async (token) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error fetching user details:', error.message || error);
      throw error;
    }
  };
  