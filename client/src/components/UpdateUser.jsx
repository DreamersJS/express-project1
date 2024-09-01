import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const UpdateUser = ({ showFeedback }) => {
  const { id } = useParams();  // Get the user ID from the URL
  const [user, setUser] = useState({ id: '', username: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); // Retrieve token from local storage or context
        if (!token) throw new Error('No token available');

        const response = await axios.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}` // Include token in request header
          }
        });

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    if (!user.id) {
      console.error('User ID is not available');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');

      await axios.put(`/api/users/update/${user.id}`, user, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('User updated:', user);
    } catch (error) {
      console.error('Error updating user:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Update User</h2>
      <input
        type="text"
        name="username"
        value={user.username}
        placeholder='Enter your new username'
        // onChange={(e) => setUser({ ...user, username: e.target.value })}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        value={user.email}
        placeholder='Enter your new email'
        // onChange={(e) => setUser({ ...user, email: e.target.value })}
        onChange={handleChange}
      />
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update'}
      </button>
    </div>
  );
}


