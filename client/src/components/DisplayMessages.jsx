import React from 'react';

const DisplayMessages = ({ user, messages, messagesListRef, messagesEndRef, handleScroll }) => {
  const [isEditing, setIsEditing] = useState(false);

  console.log(`DisplayMessages: messages: ${messages}`);

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
              <button>dropdown</button>
            </li>
          );
        })}
        <div ref={messagesEndRef} />
      </ul>
    </>
  )
}

export default DisplayMessages;
