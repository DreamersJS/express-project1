import { useRef, useEffect } from 'react';
import io from 'socket.io-client';

/**
 * Custom hook to manage socket connection.
 * @param {string} socketUrl - The base URL for the socket connection.
 * @param {string} username 
 * @param {function} showFeedback 
 * @returns {Object} - An object containing the socket reference.
 */
export const useSocketConnection = (socketUrl, user, showFeedback) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketUrl) {
      console.error('Socket URL is undefined');
      showFeedback('Error: Socket URL is undefined', 'error');
      return;
    }

    socketRef.current = io(`${socketUrl}/chat`, {
      transports: ['websocket'],
      query: { username: user?.username || 'Anonymous' }
    });

    socketRef.current.on('connect', () => {
      console.log(`Connected to /chat with ID: ${socketRef.current.id}`);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      showFeedback('Error: Connection failed', 'error');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket.IO Client disconnected');
      }
    };
  }, [socketUrl, user]);

  return socketRef;
};
