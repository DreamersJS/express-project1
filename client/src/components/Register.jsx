import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

export const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(''); 

  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess('');
  
    console.log("Submitting registration form with:", { username, password, email }); 
  
    try {
      const response = await fetch(`/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, email }) 
      });
  
      console.log({ response });
      console.log("Response status:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to register');
      }
  
      const data = await response.json();
      
      const { token } = data;  
      
      if (!token) {
        throw new Error('No token received from the server');
      }
  
      localStorage.setItem('authToken', token);
  
      console.log("Registration response data:", data);
  
      setSuccess('Registration successful! Please log in.');
  
      setTimeout(() => {
        navigate('/login');
      }, 2000);
  
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || 'Failed to register');
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
          type="email" 
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>} 
      </form>
    </div>
  );
};
