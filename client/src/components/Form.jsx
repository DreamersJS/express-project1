import { useRef, useState, useEffect } from 'react';

export const Form = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8080');
    console.log('WS Client connected');
  
    socketRef.current.onopen = () => {
      console.log('Connection opened');
    };
  
    socketRef.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      setMessages(prevMessages => [...prevMessages, event.data]);
    };
  
    socketRef.current.onclose = () => {
      console.log('WS Client disconnected');
    };
  
    socketRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };
  
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        console.log('WS Client disconnected');
      }
    };
  }, []);
  

  const handleSubmit = (event) => {
    console.log('handleSubmit');
    event.preventDefault();
    if (message) {
      socketRef.current.send(message); 
      console.log(`Send message: ${message}!`);
      setMessage(''); 
    }
    inputRef.current.focus(); 
  };

  return (
    <div>
      <h1>WebSocket Form</h1>
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

