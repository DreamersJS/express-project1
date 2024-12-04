import React, { useState } from 'react';
// import { deleteMessageById } from '../../service/service';

const DisplayMessages = ({ user, messages, messagesListRef, messagesEndRef, handleScroll, handleDeleteMessage }) => {
  const [visibleMsgDropdown, setVisibleMsgDropdown] = useState(null);
  const [isEditing, setIsEditing] = useState(null);

  console.log('Messages data:', JSON.stringify(messages, null, 2));

  const handleOpenCloseDropdown = (index) => {

    if (visibleMsgDropdown === index) {
      setVisibleMsgDropdown(null);
    } else {
      setVisibleMsgDropdown(index);
    }
  }
  // const handleEditMsg = (event, msgId) => {
  //   event.stopPropagation();
  //   setIsEditing(msgId);
  //  }
  //  const saveEdit = async (msgId, newContent) => {
  //   try {
  //     await sendMessage(msgId, { message: newContent });
  //     setIsEditing(null);
  //   } catch (error) {
  //     console.error("Error updating message:", error);
  //   }
  // };

  const handleDeleteMsg = async (event, msgId) => {
    event.stopPropagation();
    if (!msgId) {
      console.error('No msgId provided for deletion');
      return;
    }
    try {
      await handleDeleteMessage(msgId);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  return (
    <>
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
                    <button>Edit</button>
                    <button onClick={(event) => { handleDeleteMsg(event, msg.id) }}>Delete</button>
                    <button>Translate</button>
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
