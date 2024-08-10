
export const Room = () => {

    const handleSubmit = (event) => {
        event.preventDefault();
        if (message) {
          socketRef.current.emit('message', { room, message });
          setMessage('');
        }
        inputRef.current.focus();
      };

    const handleJoinRoom = (room) => {
        socketRef.current.emit('joinRoom', room);
    }
    
    return (
        <div>
            <label>
                Room:
                <input type="text" onChange={(e) => setRoom(e.target.value)} value={room} />
            </label>
            <button onClick={() => handleJoinRoom(room)}>Join Room</button>
        </div>

    );
}