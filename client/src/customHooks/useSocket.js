import { useRef, useEffect } from 'react';
import io from 'socket.io-client';

/**
 * Custom Hook for Socket Connection.
 * This allows you to use the socket connection in your component while keeping the connection logic encapsulated and reusable.
 * @param {*} url String(import.meta.env.VITE_SOCKET_URL)
 * @param {*} user useContext(AppContext).user
 * @param {*} showFeedback showFeedback
 * @returns a reference to the socket instance
 */
export const useSocket = (url, user, showFeedback) => {
    const socketRef = useRef(null);
  
    useEffect(() => {
      if (!url) {
        console.error('Socket URL is undefined');
        showFeedback('Error: Socket URL is undefined', 'error');
        return;
      }
  
      socketRef.current = io(`${url}/chat`, {
        transports: ['websocket'],
        query: { username: user?.username || 'Anonymous' }
      });
  
      socketRef.current.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err);
        showFeedback('Error: Connection failed', 'error');
      });
  
      socketRef.current.on('message', (data) => {
        if (typeof data === 'object' && data.username && data.message) {
          console.log('Received message:', data);
        } else {
          console.error('Received invalid message data:', data);
          showFeedback('Error: Received invalid message data', 'error');
        }
      });
  
      return () => {
        if (socketRef.current) {
          socketRef.current.off('message');
          socketRef.current.disconnect();
          console.log('Socket.IO Client disconnected');
        }
      };
    }, [url, user, showFeedback]);
  
    return socketRef;
  };
  
  export default useSocket;