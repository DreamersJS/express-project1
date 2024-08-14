import { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const Form = () => {
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const socketRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {

    const socketUrl = String(import.meta.env.VITE_SOCKET_URL);

    if (!socketUrl) {
      console.error('Socket URL is undefined');
      return;
    }
  
    socketRef.current = io(`${socketUrl}/chat`, {
      transports: ['websocket'], 
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });

    socketRef.current.on('connect', () => {
      console.log(`Connected to namespace /chat with ID: ${socketRef.current.id}`);
    });

    socketRef.current.on('message', (data) => {
      console.log('Received message:', data);
      setMessages(prevMessages => [...prevMessages, data]);
    });

    socketRef.current.on('typing', (user) => {
      setTypingUsers(prev => {
        if (!prev.includes(user)) {
          const updated = [...prev, user];
          return updated;
        }
        return prev;
      });
    });

    socketRef.current.on('stopTyping', (user) => {
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



  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (room) {
      console.log(`Joining room: ${room}`);
      socketRef.current.emit('joinRoom', room); 
    }
  };

  const validateMessage = (message) => {
    return message && message.trim() !== '';
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (validateMessage(message)) {
      const payload = {
        room: room || null,
        message,
      };
      socketRef.current.emit('message', payload);
      setMessage('');
    }
    inputRef.current.focus();
  };
  
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value) {
      socketRef.current.emit('typing');
    } else {
      socketRef.current.emit('stopTyping');
    }
  };

  const handleBlur = () => {
    socketRef.current.emit('stopTyping');
  };

  return (
    <div>
      <h1>Chat Application</h1>

      <form onSubmit={handleJoinRoom}>
        <input
          type="text"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter room name"
        />
        <button type="submit">Join Room</button>
      </form>

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Enter message"
          ref={inputRef}
        />
        <button type="submit">Send Message</button>
      </form>

      <div>
        <h2>Messages in {room}</h2>
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
