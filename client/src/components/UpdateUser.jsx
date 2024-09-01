import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../AppContext.jsx';
import { fetchUserDetails, verifyToken, putUserDetails } from '../../service/service.js';

export const UpdateUser = ({ showFeedback }) => {
  const { id } = useParams();
  const { user: contextUser } = useContext(AppContext);
  const [localUser, setLocalUser] = useState({ username: '', email: '' });

  useEffect(() => {
    const handleUpdateUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token available');
        return;
      }

      try {
        const isValid = await verifyToken(token);
        if (isValid) {

          if (contextUser && contextUser.id === id) {
            // Use user data from context if available
            setLocalUser(contextUser);
          } else {
            // Fetch user details if not available in context
            const userData = await fetchUserDetails(token);
            if (userData.id === id) {
              setLocalUser(userData);
            }
          }
        } else {
          console.error('Token is invalid or expired');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    handleUpdateUser();
  }, [id, contextUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    if (!id) {
      console.error('User ID is not available');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token available');
      return;
    }
    try {
      const isValid = await verifyToken(token);
      if (isValid) {
        // Pass the user object with the ID to putUserDetails
        await putUserDetails({ ...localUser, id }, token);
        console.log('User updated successfully');
      } else {
        console.error('Token is invalid or expired');
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
    }
  };

  return (
    <div>
      <h2>Update User</h2>
      <input
        type="text"
        name="username"
        value={localUser.username}
        placeholder='Enter your new username'
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        value={localUser.email}
        placeholder='Enter your new email'
        onChange={handleChange}
      />
      <button onClick={handleUpdate} >
        Update
      </button>
    </div>
  );
};
