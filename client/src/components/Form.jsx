import { useRef, useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import io from 'socket.io-client';
import './Form.css';
import { validateMessage } from '../../service/service';
import { useRoom } from '../customHooks/useRoom';

const Form = ({ showFeedback }) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);

  const { user } = useContext(AppContext);
  // Use the custom hook to get the current room
  const { room, joinRoom } = useRoom(socketRef, showFeedback);

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
      if (typeof data === 'object' && data.username && data.message) {
        console.log('Received message:', data);
        setMessages(prevMessages => [...prevMessages, data]);
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
  }, [user]);

  useEffect(() => {

    const isScrolledToBottom = () => {
      const messagesList = messagesListRef.current;
      return messagesList.scrollHeight - messagesList.clientHeight <= messagesList.scrollTop + 1;
    };

    if (isScrolledToBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowScrollButton(true);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();

    if (!newRoomName.trim()) {
      showFeedback('Please enter a valid room name.', 'error');
      console.log('Please enter a valid room name.');
      return;
    }
    if (newRoomName.trim()) {
      joinRoom(newRoomName); // This will handle leaving the current room and joining the new one
      setNewRoomName(''); // Clear the input field after joining
      socketRef.current.emit('joinRoom', room);
      showFeedback(`Joined room: ${room}`, 'info');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (validateMessage(message)) {
      const payload = {
        roomId: room.id || null, // Use room ID from the custom hook
        roomName: room.name || null, // Use room name from the custom hook
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
  };
  
  return (
    <div className='container'>

      {/*Join room*/}
      <div className="join-room">
        <form onSubmit={handleJoinRoom} className='chat-container'>
          <div className="chat-group">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name"
            />
            <button type="submit">Join Room</button>
          </div>
        </form>
      </div>

      <>
        {room.name && <h2>Messages in {room.name}</h2>}
        <ul className='msg-display'
          ref={messagesListRef}
          onScroll={() => setShowScrollButton(messagesListRef.current.scrollTop < messagesListRef.current.scrollHeight - messagesListRef.current.clientHeight - 1)}
        >
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
                {(typeof msg.username === 'string' ? msg.username : 'Unknown') + ': ' + (typeof msg.message === 'string' ? msg.message : 'Invalid message')}
              </li>
            );
          })}

          {/* This div is used to scroll into view */}
          <div ref={messagesEndRef} />
        </ul>

        {showScrollButton && (
          <>
            <p className='scroll-to-bottom'>
              <button onClick={scrollToBottom}>
                Scroll to Latest
              </button>
            </p>
          </>
        )}
      </>

      <div className="msg-input">
        <form onSubmit={handleSendMessage} className='chat-container'>
          <div className="chat-group">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
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

export default Form;
