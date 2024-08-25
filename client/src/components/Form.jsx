import { useRef, useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import io from 'socket.io-client';
import './Form.css';

export const Form = ({ showFeedback }) => {
  const [room, setRoom] = useState('');
  const [activeRoom, setActiveRoom] = useState('');
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // const [typingUsers, setTypingUsers] = useState([]);

  const { user } = useContext(AppContext);

  const socketRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const socketUrl = String(import.meta.env.VITE_SOCKET_URL);

    if (!socketUrl) {
      console.error('Socket URL is undefined');
      showFeedback('Error: Socket URL is undefined', 'error');
      return;
    }

    socketRef.current = io(`${socketUrl}/chat`, {
      transports: ['websocket'],
      query: { username: user?.username || 'Anonymous' }
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      showFeedback('Error: Connection failed', 'error');
    });

    socketRef.current.on('connect', () => {
      console.log(`Connected to namespace /chat with ID: ${socketRef.current.id}`);
    });

    socketRef.current.on('message', (data) => {
      console.log('Received message:', data);
      setMessages(prevMessages => [...prevMessages, data]);
    });

    // socketRef.current.on('typing', (user) => {
    //   setTypingUsers(prev => prev.includes(user) ? prev : [...prev, user]);
    // });

    // socketRef.current.on('stopTyping', (user) => {
    //   setTypingUsers(prev => prev.filter(u => u !== user));
    // });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('message');
        socketRef.current.off('typing');
        socketRef.current.off('stopTyping');
        socketRef.current.disconnect();
        console.log('Socket.IO Client disconnected');
      }
    };
  }, [user]);

  const handleJoinRoom = (e) => {
    e.preventDefault();

    if (!room.trim()) {
      showFeedback('Please enter a valid room name.', 'error');
      console.log('Please enter a valid room name.');
      return;
    }

    console.log(`Joining room: ${room}`);
    showFeedback(`Joined room: ${room}`, 'info');
    socketRef.current.emit('joinRoom', room);
    setActiveRoom(room);
    setRoom('');
    setJoinedRooms(prevRooms => [...prevRooms, room]);
  };

  const validateMessage = (message) => {
    return message && message.trim() !== '';
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (validateMessage(message)) {
      const payload = {
        room: activeRoom || null,
        message,
        username: user?.username || 'Anonymous',
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
    <div className='container'>

      <div className="join-room">
        <form onSubmit={handleJoinRoom} className='chat-container'>
          <div className="chat-group">
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Enter room name"
            />
            <button type="submit">Join Room</button>
          </div>
        </form>
      </div>

      <>
        {activeRoom && <h2>Messages in {activeRoom}</h2>}
        <ul className='msg-display'>
          {messages.map((msg, index) => {
            let className;
            if (msg.username === user?.username) {
              className = 'user';
            } else if (msg.username === 'System') {
              className = 'system';
            } else {
              className = 'other';
            }
            return (
              <li
                key={index}
                className={className}
              >
                {msg.username ? `${msg.username}: ${msg.message}` : msg.message}
              </li>
            );
          })}
        </ul>
        {/* <p className="activity">
          {typingUsers.length > 0 ? `${typingUsers.join(', ')} ${typingUsers.length > 1 ? 'are' : 'is'} typing...` : ''}
        </p> */}
      </>

      <div className="msg-input">
        <form onSubmit={handleSendMessage} className='chat-container'>
          <div className="chat-group">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Enter message"
              ref={inputRef}
            />
            <button type="submit">Send Message</button>
          </div>
        </form>
      </div>

    </div>
  );
};
