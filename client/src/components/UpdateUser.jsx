import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../AppContext.jsx';
import { fetchUserDetails, verifyToken, putUserDetails } from '../../service/service.js';

 const UpdateUser = ({ showFeedback }) => {
  const { id } = useParams();
  const { user: contextUser } = useContext(AppContext);
  const [localUser, setLocalUser] = useState({ username: '', email: '' });
  const [initialUser, setInitialUser] = useState({ username: '', email: '' });

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
            setInitialUser(contextUser);
          } else {
            // Fetch user details if not available in context
            const userData = await fetchUserDetails(token);
            if (userData.id === id) {
              setLocalUser(userData);
              setInitialUser(userData);
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
    
    // Check if there are any changes
    if (JSON.stringify(localUser) === JSON.stringify(initialUser)) {
      console.log('No changes detected');
      showFeedback(`No changes detected`, 'info');
      return;
    }

    try {
      const isValid = await verifyToken(token);
      if (isValid) {
        // Pass the user object with the ID to putUserDetails
        await putUserDetails({ ...localUser, id }, token);
        console.log('User updated successfully');
        showFeedback(`User updated successfully`, 'info');
        // update initialUser to reflect the latest changes
        setInitialUser(localUser);
      } else {
        console.error('Token is invalid or expired');
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
      showFeedback('Error updating user:', 'error');
    }
  };

  return (
    <>
    <div className="form-container">
      <h2>Update User</h2>
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          name="username"
          value={localUser.username}
          placeholder='Enter your new username'
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          value={localUser.email}
          placeholder='Enter your new email'
          onChange={handleChange}
        />
      </div>
      <button onClick={handleUpdate} >
        Update
      </button>
    </div>
    </>
  );
};

export default UpdateUser;
