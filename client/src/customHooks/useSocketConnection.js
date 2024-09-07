import { useRef, useEffect } from 'react';
import io from 'socket.io-client';

export const useSocketConnection = (user, showFeedback) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = String(import.meta.env.VITE_SOCKET_URL);
    
    if (!socketUrl) {
      console.error('Socket URL is undefined');
      showFeedback('Error: Socket URL is undefined', 'error');
      return;
    }
  
    console.log('Attempting to connect to socket at:', socketUrl); 
    socketRef.current = io(`${socketUrl}/chat`, {
      transports: ['websocket'],
      query: { username: user?.username || 'Anonymous' }
    });
  
    socketRef.current.on('connect', () => {
      console.log('Socket connected with ID:', socketRef.current.id); 
    });
  
    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err); 
      showFeedback('Error: Connection failed', 'error');
    });
  
    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket');
        socketRef.current.disconnect();
      }
    };
  }, [user, showFeedback]);
  

  return socketRef;
};
