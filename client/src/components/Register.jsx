import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateForm, registerUser } from '../../service/service.js';
import { AppContext } from '../AppContext.jsx';
import './Register.css'; 

export const Register = ({ showFeedback }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AppContext); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm({ username, email, password });
    if (validationError) {
      showFeedback(validationError, 'error');
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({ username, password, email });
      handleToken(data.token);  
      login(data.user, data.token); // Persist user and token

      showFeedback('Registration successful! Redirecting to login...', 'success');
      navigate('/login'); 

    } catch (err) {
      showFeedback(err.message || 'Failed to register', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToken = (token) => {
    if (!token) {
      throw new Error('No token received from the server');
    }
    localStorage.setItem('authToken', token);
  };

  return (
    <div className="form-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
          Register
        </button>
      </form>
    </div>
  );
};
