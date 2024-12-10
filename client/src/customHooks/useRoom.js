import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketProvider';

/**
 * 
 * @param {*} socket socketRef
 * @param {*} showFeedback showFeedback
 * @returns {Object} An object containing the current room state and the joinRoom function.
 */
export const useRoom = ( showFeedback) => {
  const [room, setRoom] = useState({ id: null, name: '' });
  const { onEvent, offEvent, sendEvent, socket } = useSocket();

  useEffect(() => {
    if (socket) {
      // Handle the 'roomCreated' event
      const handleRoomCreated = ({ roomId, roomName }) => {
        setRoom({ id: roomId, name: roomName }); 
        showFeedback(`Joined room: ${roomName}`, 'info');  
      };

      // Listen for the 'roomCreated' event
      onEvent('roomCreated', handleRoomCreated);

      // Cleanup to avoid memory leaks
      return () => {
        offEvent('roomCreated', handleRoomCreated);
      };
    }
  }, [socket, onEvent, offEvent, showFeedback]);

  /**
   * This will handle leaving the current room and joining the new one
   * @param {string} newRoomName 
   */
  const joinRoom = (newRoomName) => {
    try {
      if (socket && newRoomName !== room.name) {
        if (room.id) {
          // Leave the current room
          sendEvent('leaveRoom', room.id);
        }
        // Join the new room
        sendEvent('joinRoom', newRoomName);
        console.log(`Joining room: ${newRoomName} with socket ID: ${socket.id}`);
      }
    } catch (error) {
      console.error('Error creating/joining room:', error);
      sendEvent('error', { message: 'Failed to join room' });
    }
  };

  return { room, joinRoom }; // Return the room state and the joinRoom function
};
