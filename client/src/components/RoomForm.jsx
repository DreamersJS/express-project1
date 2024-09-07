import React, { useState } from 'react';
import { useRoom } from '../customHooks/useRoom';

const RoomForm = ({ room, joinRoom, showFeedback }) => {
  const [newRoomName, setNewRoomName] = useState('');
  // const { room, joinRoom } = useRoom(socketRef, showFeedback);

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
