import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const Auth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('/api/verify-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(data.valid);
          } else {
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          setIsAuthenticated(false);
          setError('Failed to verify token');
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  return <>{children}</>;
};
