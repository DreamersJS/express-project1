import { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';

export const Form = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);
  const inputRef = useRef(null);

 
  useEffect(() => {
    socketRef.current = io('http://localhost:3500'); 
    console.log('Socket.IO Client connected');
  
    socketRef.current.on('message', (data) => {
      console.log('Received message:', data);
      setMessages(prevMessages => [...prevMessages, data]);
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

  return (
    <div>
      <h1>Socket.IO Form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Message:
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
      </div>
    </div>
  );
};
