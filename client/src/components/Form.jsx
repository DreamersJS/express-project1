import { useRef, useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import io from 'socket.io-client';
import './Form.css';
import { validateMessage } from '../../service/service';
import { useRoom } from '../customHooks/useRoom';

const Form = ({ showFeedback }) => {
  const { user } = useContext(AppContext);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);

  const [newRoomName, setNewRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

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
      try {
        console.log('Message received from server:', data);
        if (data && data.username && data.message) {
          setMessages(prevMessages => [...prevMessages, data]);
        } else {
          console.error('Received unexpected message format:', data);
          showFeedback('Error: Received invalid message format', 'error');
        }
      } catch (error) {
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
    const fetchMessages = async (page) => {
      try {
        const response = await fetch(`/api/users/rooms/${room?.name}/messages?page=${page}&limit=20`);
    
        if (!response.ok) {
          // Handle HTTP errors
          console.error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
          showFeedback(`Error: Failed to fetch messages (${response.status})`, 'error');
          return;
        }
        console.log(`response: ${response}`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Received non-JSON response');
          showFeedback('Error: Received invalid response format', 'error');
          return;
        }
    
        const newMessages = await response.json();
        console.log(`newMessages: ${newMessages}`);
        if (newMessages.length < 20) {
          setHasMoreMessages(false);
        }
        setMessages(prevMessages => [...prevMessages, ...newMessages]);
      } catch (error) {
        console.error('Error fetching messages:', error);
        showFeedback('Error: Failed to fetch messages', 'error');
      }
    };
    

    if (room?.name) {
      fetchMessages(currentPage);
    }
  }, [room?.name, currentPage]);

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
    try {
      if (newRoomName.trim()) {
        joinRoom(newRoomName);
        setNewRoomName('');
        socketRef.current.emit('joinRoom', room);
        showFeedback(`Joined room: ${room}`, 'info');
      } else {
        showFeedback('Please enter a valid room name.', 'error');
      }
    } catch (error) {
      console.error('Error joining room:', error);
      showFeedback('Error: Failed to join room', 'error');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    try {
      if (validateMessage(message)) {
        const payload = {
          roomId: room?.id || null,
          roomName: room?.name || null,
          message,
          username: user?.username || 'Anonymous',
        };
        socketRef.current.emit('message', payload);
        setMessage('');
        inputRef.current.focus();
      } else {
        showFeedback('Please enter a valid message.', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showFeedback('Error: Failed to send message', 'error');
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleScroll = () => {
    const messagesList = messagesListRef.current;
    if (messagesList.scrollTop === 0 && hasMoreMessages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
    setShowScrollButton(messagesList.scrollTop < messagesList.scrollHeight - messagesList.clientHeight - 1);
  };

  return (
    <div className='container'>
      {/* Join Room */}
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

      {/* Messages Display */}
      {room.name && <h2>Messages in {room.name}</h2>}
      <ul className='msg-display' ref={messagesListRef} onScroll={handleScroll}>
        {messages.map((msg, index) => {
          const className = msg.username === user?.username
            ? 'user'
            : msg.username === 'System'
              ? 'system'
              : 'other';
          return (
            <li key={index} className={className}>
              {(typeof msg.username === 'string' ? msg.username : 'Unknown') + ': ' + (typeof msg.message === 'string' ? msg.message : 'Invalid message')}
            </li>
          );
        })}
        <div ref={messagesEndRef} />
      </ul>

      {showScrollButton && (
        <p className='scroll-to-bottom'>
          <button onClick={scrollToBottom}>Scroll to Latest</button>
        </p>
      )}

      {/* Message Input */}
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
