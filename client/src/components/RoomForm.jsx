import React, { useState } from 'react';

const RoomForm = ({ joinRoom, currentRoomName, showFeedback }) => {
  const [newRoomName, setNewRoomName] = useState('');

  const handleJoinRoom = (e) => {
    e.preventDefault();

    if (newRoomName.trim()) {
      if (newRoomName !== currentRoomName) {
        joinRoom(newRoomName);
        setNewRoomName('');
        showFeedback(`Attempting to join room: ${newRoomName}`, 'info');
      } else {
        showFeedback('You are already in this room.', 'error');
      }
    } else {
      showFeedback('Please enter a valid room name.', 'error');
    }
  };


  return (
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
  );
};

export default RoomForm;
