import React, { useEffect, useState } from 'react';
// import { editMessageById } from '../../service/service';

const DisplayMessages = ({ user, messages, messagesListRef, messagesEndRef, handleScroll, handleDeleteMessage, loadNextPage, handleEditMessage, isLoading }) => {
  const [visibleMsgDropdown, setVisibleMsgDropdown] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const toggleModal = () => {
    setIsModalVisible(prev => !prev);
  };

  // console.log('Messages data:', JSON.stringify(messages, null, 2));
  useEffect(() => {
    console.log(`newMessage: ${newMessage}`);
  }, [newMessage]);

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
              {`${msg.username || 'Unknown'}: ${msg.message || 'Invalid message'}`}
              {

                msg.username === user?.username && msg.id
                  ? <button onClick={() => handleOpenCloseDropdown(msg.id)}>dropdown{`${msg.id}`}</button>
                  : null
              }
              {
                visibleMsgDropdown === msg.id && (
                  <div>
                    <button onClick={(event) => { handleEditMsg(event, msg.id, msg.message) }}>Edit</button>
                    <button onClick={(event) => { handleDeleteMsg(event, msg.id) }}>Delete</button>
                    <button>Translate</button>
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
                    <button onClick={() => handleEditMessage(msg.id, newMessage)}>Save</button>
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
