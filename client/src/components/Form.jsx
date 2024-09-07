import { useRef, useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import io from 'socket.io-client';
import './Form.css';
import { useRoom } from '../customHooks/useRoom';
import { useMessages } from '../customHooks/useMessages';
import { useSocketConnection } from '../customHooks/useSocketConnection';
import RoomForm from './RoomForm';
import ScrollButton from './ScrollButton';
import DisplayMessages from './DisplayMessages';

const Form = ({ showFeedback }) => {
  const { user } = useContext(AppContext);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);

  const [message, setMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  
  if (!socketUrl) {
    console.error('Socket URL is undefined');
    showFeedback('Error: Socket URL is undefined', 'error');
    return;
  }
  
  const socketRef = useSocketConnection(socketUrl, user, showFeedback);
  const { room, joinRoom } = useRoom(socketRef, showFeedback);

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

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100); 
    }
  }, [messages]);
  

  return (
    <div className='container'>
      {/* Join Room */}
      <RoomForm joinRoom={joinRoom} currentRoomName={room.name} showFeedback={showFeedback} />

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
