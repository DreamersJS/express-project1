import { useRef, useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import io from 'socket.io-client';
import './Form.css';
import { validateMessage, fetchMessages } from '../../service/service';
import { useRoom } from '../customHooks/useRoom';
import { useMessages } from '../customHooks/useMessages';
import { useSocketConnection } from '../customHooks/useSocketConnection';
import RoomForm from './RoomForm';
import ScrollButton from './ScrollButton';
import DisplayMessages from './DisplayMessages';

const Form = ({ showFeedback }) => {
  const { user } = useContext(AppContext);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);

  const [newRoomName, setNewRoomName] = useState('');
  const [message, setMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const { room, joinRoom } = useRoom(socketRef, showFeedback);

  useEffect(() => {

    const socketUrl = import.meta.env.VITE_SOCKET_URL;

    if (!socketUrl) {
      console.error('Socket URL is undefined');
      showFeedback('Error: Socket URL is undefined', 'error');
      return;
    }

    socketRef.current = io(`${socketUrl}/chat`, { transports: ['websocket'], query: { username: user?.username } });

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
  }, [user,]);

  // Handle messages with useMessages hook
  const { sendMessage, messages, loadMessages } = useMessages(
    socketRef,
    room,
    currentPage,
    setHasMoreMessages,
    showFeedback
  );

  useEffect(() => {
    if (room.name) {
      loadMessages();
    }
  }, [room, currentPage]);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    try {
      if (newRoomName.trim()) {
        joinRoom(newRoomName);
        setNewRoomName('');
        showFeedback(`Joined room: ${newRoomName}`, 'info');
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
    if (message.trim()) {
      sendMessage(message, user?.username);

      setMessage('');
    } else {
      showFeedback('Please enter a valid message.', 'error');
    }
  };

  const handleScroll = () => {
    const messagesList = messagesListRef.current;
    if (messagesList.scrollTop === 0 && hasMoreMessages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
    setShowScrollButton(
      messagesList.scrollTop < messagesList.scrollHeight - messagesList.clientHeight - 1
    );
  };
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    if (messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      {room.name && <h3>Messages in {room.name}</h3>}
      <DisplayMessages
        user={user}
        messages={messages}
        messagesListRef={messagesListRef}
        messagesEndRef={messagesEndRef}
        handleScroll={handleScroll}
      />
      <ScrollButton show={showScrollButton} scrollToBottom={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })} />

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
