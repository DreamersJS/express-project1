import { useRef, useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import './Form.css';
import { useRoom } from '../customHooks/useRoom';
import { useMessages } from '../customHooks/useMessages';
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
  // to refactor useRoom with useSocket provider
  const { room, joinRoom } = useRoom( showFeedback);
  const { messages,
    sendMessage,
    loadMessages,
    loadNextPage,
    handleEditMessage,
    handleDeleteMessage,
    hasMoreMessages,
    currentPage,
    isLoading
  } = useMessages(
    room,
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
      loadNextPage();
    }
    setShowScrollButton(
      messagesList.scrollTop < messagesList.scrollHeight - messagesList.clientHeight - 1
    );
  };
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };


  return (
    <div className='container'>
      {/* Join Room */}
      <RoomForm joinRoom={joinRoom} currentRoomName={room.name} showFeedback={showFeedback} />

      {/* Messages Display */}
      {room.name && <h4>Messages in {room.name}</h4>}
      <DisplayMessages
        user={user}
        messages={messages}
        messagesListRef={messagesListRef}
        messagesEndRef={messagesEndRef}
        handleScroll={handleScroll}
        handleDeleteMessage={handleDeleteMessage}
        loadNextPage={loadNextPage}
        handleEditMessage={handleEditMessage}
        isLoading={isLoading}
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
