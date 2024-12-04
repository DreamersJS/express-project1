import { useState, useEffect, useCallback } from 'react';
import { fetchMessages, validateMessage, editMessageById, deleteMessageById } from '../../service/service';

export const useMessages = (socketRef, room, currentPage, setHasMoreMessages, showFeedback) => {
  const [messages, setMessages] = useState([]);
  const [editMessageId, setEditMessageId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  // const [isEditing, setIsEditing] = useState(null);

  const loadMessages = useCallback(async () => {
    if (room?.name) {
      try {
        const fetchedMessages = await fetchMessages(room.name, currentPage);
        if (fetchedMessages) {
          if (fetchedMessages.length < 20) {
            setHasMoreMessages(false);
          }

          // Combine fetched messages with existing messages, avoiding duplicates
          setMessages((prevMessages) => {
            const combined = [...prevMessages, ...fetchedMessages];
            const uniqueMessages = combined.filter(
              (message, index, self) =>
                index === self.findIndex((m) => m.id === message.id)
            );
            return uniqueMessages;
          });

          // Append new messages to the existing messages
          // setMessages(prevMessages => Array.isArray(prevMessages)
          //   ? [...prevMessages, ...fetchedMessages]
          //   : fetchedMessages
          // );

        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        showFeedback('Error: Failed to fetch messages', 'error');
      }
    }
  }, [room, currentPage, setHasMoreMessages]);

  // useEffect(() => {
  //   loadMessages();
  // }, [loadMessages]);

  // Reset messages when room changes
  useEffect(() => {
    setMessages([]); // Clear messages when room changes
    loadMessages(); // Reload messages for the new room
  }, [room, loadMessages]);

  useEffect(() => {
    const handleIncomingMessages = (data) => {
      if (data && data.username && data.message) {
        setMessages(prevMessages => Array.isArray(prevMessages) ? [...prevMessages, data] : [data]);
      } else {
        console.error('Received unexpected message format:', data);
      }
    };

    if (socketRef.current) {
      socketRef.current.on('message', handleIncomingMessages);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('message', handleIncomingMessages);
      }
    };
  }, [socketRef]);

  const sendMessage = useCallback((message, username) => {
    if (validateMessage(message)) {
      if (socketRef.current) {
        socketRef.current.emit('message', { roomId: room.id, message, username });
      }
    } else {
      console.error('Received unexpected message format:', error);
    }
  }, [socketRef, room]);

  const handleEditMessage = useCallback((messageId, message) => {
    if (validateMessage(message)) {
      if (socketRef.current) {
        editMessageById(messageId, message);
      }
    } else {
      showFeedback('Invalid message format', 'error');
    }
  }, [socketRef, room]);

  const handleCancelEdit = () => {
    setEditMessageId(null);
    setEditMessage('');
  };

  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await deleteMessageById(messageId);
      setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== messageId));
      showFeedback('Message deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting message:', error);
      showFeedback('Failed to delete message', 'error');
    }
  }, []);


  return { sendMessage, loadMessages, handleEditMessage, handleCancelEdit, handleDeleteMessage, messages, hasMoreMessages: true };
};
