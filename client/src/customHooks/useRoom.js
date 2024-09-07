import { useState, useEffect } from 'react';

/**
 * 
 * @param {*} socket socketRef
 * @param {*} showFeedback showFeedback
 * @returns {Object} An object containing the current room state and the joinRoom function.
 */
export const useRoom = (socket, showFeedback) => {
  const [room, setRoom] = useState({ id: null, name: '' });

  useEffect(() => {
    if (socket.current) {
      // Handle the 'roomCreated' event
      const handleRoomCreated = ({ roomId, roomName }) => {
        setRoom({ id: roomId, name: roomName }); // Update the room state
        showFeedback(`Joined room: ${roomName}`, 'info'); // Provide feedback to the user
      };

      // Listen for the 'roomCreated' event
      socket.current.on('roomCreated', handleRoomCreated);

      // Cleanup to avoid memory leaks
      return () => {
        socket.current.off('roomCreated', handleRoomCreated);
      };
    }
  }, [socket, showFeedback]);

  /**
   * This will handle leaving the current room and joining the new one
   * @param {string} newRoomName 
   */
  const joinRoom = (newRoomName) => {
    try {
      if (socket.current && newRoomName !== room.name) {
        if (room.id) {
          // Leave the current room
          socket.current.emit('leaveRoom', room.id);
        }
        // Join the new room
        socket.current.emit('joinRoom', newRoomName);
        console.log(`Joining room: ${newRoomName} with socket ID: ${socket.id}`);
      }
    } catch (error) {
      console.error('Error creating/joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  };

  return { room, joinRoom }; // Return the room state and the joinRoom function
};
