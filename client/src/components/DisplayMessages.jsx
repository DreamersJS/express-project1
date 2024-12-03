import React, { useState } from 'react';

const DisplayMessages = ({ user, messages, messagesListRef, messagesEndRef, handleScroll }) => {
  const [visibleMsgDropdown, setVisibleMsgDropdown] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // console.log(`DisplayMessages: messages: ${messages}`);

  const handleOpenCloseDropdown = (index) => {
    console.log('Open dropdown');

    if (visibleMsgDropdown === index) {
      setVisibleMsgDropdown(null);
    } else {
      setVisibleMsgDropdown(index);
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
                msg.username === user?.username
                  ? <button onClick={()=> handleOpenCloseDropdown(index)}>dropdown</button>
                  : null
              }
              {
                visibleMsgDropdown === index && (
                  <div>
                    <button>Edit</button>
                    <button>Delete</button>
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
