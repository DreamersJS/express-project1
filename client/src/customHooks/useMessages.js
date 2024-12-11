import { useState, useEffect, useCallback } from 'react';
import { fetchMessages, validateMessage, editMessageById, deleteMessageById } from '../../service/service-msg';
import { useSocket } from '../context/SocketProvider';

// Improved Modularity: The hook is now decoupled from socketRef, making it easier to test and reuse.
export const useMessages = (room, showFeedback) => {
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isEditing, setIsEditing] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { onEvent, offEvent, sendEvent } = useSocket();

  const loadMessages = useCallback(async () => {
    if (room?.name) {
      setIsLoading(true);
      try {
        const fetchedMessages = await fetchMessages(room.name, currentPage, 'asc');
        setIsLoading(false);
        if (fetchedMessages) {
          if (fetchedMessages.length < 20) {
            setHasMoreMessages(false);
          }

          // Combine fetched messages with existing messages, avoiding duplicates
          setMessages((prevMessages) => {
            const combined = [...prevMessages, ...fetchedMessages]; // Fetch messages in reverse order: newer messages first
            const uniqueMessages = combined.filter(
              (message, index, self) =>
                index === self.findIndex((m) => m.id === message.id)
            );
            return uniqueMessages;
          });

        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        showFeedback('Error: Failed to fetch messages', 'error');
      }
    }
  }, [room, currentPage]);

  // Handle edit and delete events from other users, updating the UI
  useEffect(() => {
    const handleEdit = ({ id, content }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id ? { ...msg, message: content } : msg
        )
      );
    };
  
    const handleDelete = ({ messageId }) => {
     setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== messageId));
    };
  
    onEvent('messageEdited', handleEdit);
    onEvent('messageDeleted', handleDelete);
  
    return () => {
      offEvent('messageEdited', handleEdit);
      offEvent('messageDeleted', handleDelete);
    };
  }, [onEvent, offEvent]);

  // Reset messages and pagination when the room changes
  useEffect(() => {
    setMessages([]);
    setCurrentPage(1);
    setHasMoreMessages(true);
    loadMessages();
  }, [room]);

  // Handle incoming messages via socket
  useEffect(() => {
    const handleIncomingMessages = (data) => {
      if (data && data.username && data.message) {
        setMessages(prevMessages => Array.isArray(prevMessages) ? [...prevMessages, data] : [data]); // New messages come first
      } else {
        console.error('Received unexpected message format:', data);
      }
    };

    onEvent('message', handleIncomingMessages);

    return () => {
      offEvent('message', handleIncomingMessages);
    };
  }, [onEvent, offEvent]);

  const sendMessage = useCallback((message, username) => {
    if (validateMessage(message)) {
      sendEvent('message', { roomId: room.id, message, username });
    } else {
      console.error('Received unexpected message format:', error);
    }
  }, [sendEvent, room]);

  const handleEditMessage = useCallback((messageId, message) => {
    if (validateMessage(message)) {
      try {
        editMessageById(messageId, message);
        sendEvent('editMessage', { messageId, newContent: message }  );
        loadMessages();
        showFeedback('Message edited successfully', 'success');
      } catch (error) {
        console.error('Error editing message:', error);
        showFeedback('Failed to edit message', 'error');
        throw error;
      }
    } else {
      showFeedback('Invalid message format', 'error');
      throw new Error('Invalid message format');
    }
  }, [loadMessages, sendEvent]);

  const handleCancelEdit = () => {
    setIsEditing(null);
    setNewMessage('');
  };

  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await deleteMessageById(messageId);
      await sendEvent('deleteMessage', messageId );
      // with the useEffect for 'deleteMessage' event, the message will be removed from the UI
      // setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== messageId));
      showFeedback('Message deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting message:', error);
      showFeedback('Failed to delete message', 'error');
    }
  }, [sendEvent]);

  const loadNextPage = useCallback(() => {
    if (hasMoreMessages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [hasMoreMessages]);

  return {
    messages,
    sendMessage,
    loadMessages,
    loadNextPage,
    handleEditMessage,
    handleDeleteMessage,
    hasMoreMessages,
    currentPage,
    isLoading
  };
};
