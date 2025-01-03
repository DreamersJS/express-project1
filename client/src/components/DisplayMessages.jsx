import React, { useEffect, useState } from 'react';
import { translateMessage } from '../../service/translationService';

const DisplayMessages = ({ user, messages, messagesListRef, messagesEndRef, handleScroll, handleDeleteMessage, loadNextPage, handleEditMessage, isLoading }) => {
  const [visibleMsgDropdown, setVisibleMsgDropdown] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [translatedMessages, setTranslatedMessages] = useState({});

  useEffect(() => {
    console.log('Updated translatedMessages:', translatedMessages);
  }, [translatedMessages]);
  
  const handleTranslate = async (e, msg, targetLang = 'en') => {
    e.stopPropagation();

    try {
      // Check if the message is already translated
      if (translatedMessages[msg.id]) {
        return;
      }

      const translatedText = await translateMessage(msg.message, targetLang);

      // Update the state with the new translated message
      setTranslatedMessages((prev) => ({
        ...prev,
        [msg.id]: translatedText, 
      }));
    } catch (error) {
      console.error('Error translating message:', error);
    }
  };
  
  const toggleModal = () => {
    setIsModalVisible(prev => !prev);
  };

  const handleOpenCloseDropdown = (index) => {

    if (visibleMsgDropdown === index) {
      setVisibleMsgDropdown(null);
    } else {
      setVisibleMsgDropdown(index);
    }
  }

  const handleEditMsg = (event, msgId, message) => {
    event.stopPropagation();
    setNewMessage(message);
    setIsEditing(msgId);
    toggleModal();
  }

  const handleSaveEdit = async (msgId, editedMessage) => {
    try {
      await handleEditMessage(msgId, editedMessage); 
      setIsEditing(null); 
      toggleModal(); 
    } catch (error) {
      console.error('Error saving the edited message:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    toggleModal();
  };

  const handleDeleteMsg = async (event, msgId) => {
    event.stopPropagation();
    if (!msgId) {
      console.error('No msgId provided for deletion');
      return;
    }
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this message?");
      if (confirmDelete) {
        await handleDeleteMessage(msgId);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  return (
    <>
      {isLoading && <div className="loader">Loading...</div>}
      <ul className='msg-display' ref={messagesListRef} onScroll={handleScroll}>
        {messages.map((msg, index) => {
          const className = msg.username === user?.username
            ? 'user'
            : msg.username === 'System'
              ? 'system'
              : 'other';
          return (
            <li key={index} className={className}>
              <span className="username">
                {msg.username || 'Unknown'}:
              </span>
              
              {translatedMessages && translatedMessages[msg.id] ? (
                <span className="message translated-message">
                  {translatedMessages[msg.id]}
                </span>
              ) : (
                <span className="message">
               {msg.message || 'Invalid message'}
              </span>
              )}
              {

                msg.username === user?.username && msg.id
                  ? <button onClick={() => handleOpenCloseDropdown(msg.id)}>dropdown</button>
                  : null
              }
              {
                visibleMsgDropdown === msg.id && (
                  <div>
                    <button onClick={(event) => { handleEditMsg(event, msg.id, msg.message) }}>Edit</button>
                    <button onClick={(event) => { handleDeleteMsg(event, msg.id) }}>Delete</button>
                    <button onClick={(event) => { handleTranslate(event, msg, 'en') }}>Translate</button>
                  </div>
                )
              }
              {/* edit modal */}
              {
                isModalVisible && isEditing === msg.id && (
                  <div>
                    <input
                      type='text'
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      placeholder='Enter new message'
                    />
                    <button onClick={() => handleSaveEdit(msg.id, newMessage)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </div>
                )
              }
            </li>
          );
        })}
        <div ref={messagesEndRef} />
      </ul>

    </>
  )
}

export default DisplayMessages;
