import React, { useState } from 'react';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log("Submitting registration form with:", { username, password });

    try {
      const response = await fetch(`/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      console.log({response});
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to register');
      }

      const data = await response.json();
      console.log("Registration response data:", data);

      // Handle successful registration (e.g., redirect user or show success message)
    } catch (err) {
      console.error("Registration error:", err);
      setError('Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Register</h1>
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
          Register
        </button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};
