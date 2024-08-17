import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log("Submitting login form with:", { username, password });

    try {
      const response = await fetch(`/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to login');
      }

      const data = await response.json();
      console.log("Login response data:", data);

      // Store token or user information in context
      setUser({ username, token: data.token });

      // Optionally redirect user or handle successful login
    } catch (err) {
      console.error("Login error:", err);
      setError('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          Login
        </button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};
