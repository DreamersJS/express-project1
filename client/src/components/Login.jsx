import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { loginUser } from '../../service/service.js';

 const Login = ({ showFeedback }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('User updated:', user);
      navigate('/chat');  // Redirect if user is already logged in
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      if (!data || !data.username || !data.token || !data.id) {
        console.log('LoginData:', data);
        throw new Error("Username, id, or token is missing in the response");
      }

      // Update context with user info, including id
      login({ id: data.id, username: data.username, email: data.email }, data.token);

      showFeedback('Login successful!', 'success');
      navigate('/chat');
    } catch (err) {
      console.error('Login error:', err);
      showFeedback('Failed to login. Please check your credentials and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
