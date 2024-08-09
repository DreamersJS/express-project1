import { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const Form = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const socketRef = useRef(null);
  const inputRef = useRef(null);


  useEffect(() => {
    // const socketUrl = process.env.REACT_APP_SOCKET_URL;
    const socketUrl = import.meta.env.VITE_SOCKET_URL;

    socketRef.current = io(socketUrl);
    console.log('Socket.IO Client connected');

    socketRef.current.on('message', (data) => {
      console.log('Received message:', data);
      setMessages(prevMessages => [...prevMessages, data]);
    });

    socketRef.current.on('typing', (user) => {
      console.log('Typing event received:', user);
      setTypingUsers(prev => {
        if (!prev.includes(user)) {
          const updated = [...prev, user];
          console.log('Typing users updated:', updated);
          return updated;
        }
        return prev;
      });
    });
    
    socketRef.current.on('stopTyping', (user) => {
      console.log('StopTyping event received:', user);
      setTypingUsers(prev => {
        return prev.filter(u => u !== user);
      });
    });
    

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket.IO Client disconnected');
      }
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (message) {
      console.log(`Sending message: ${message}`);
      socketRef.current.emit('message', message);
      setMessage('');
    }
    inputRef.current.focus();
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    console.log('Input change:', e.target.value);
    if (e.target.value) {
      socketRef.current.emit('typing');
      console.log('Emitting typing event');
    } else {
      socketRef.current.emit('stopTyping');
      console.log('Emitting stopTyping event');
    }
  };
  
  const handleBlur = () => {
    socketRef.current.emit('stopTyping');
    console.log('Emitting stopTyping event on blur');
  };
  
  return (
    <div>
      <h1>Socket.IO Form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Message:
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            onBlur={handleBlur}
            ref={inputRef}
          />
        </label>
        <button type="submit">Send</button>
      </form>
      <div>
        <h2>Received Messages</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
        <p className="activity">
          {typingUsers.length > 0 ? `${typingUsers.join(', ')} ${typingUsers.length > 1 ? 'are' : 'is'} typing...` : ''}
        </p>

      </div>
    </div>
  );
};
