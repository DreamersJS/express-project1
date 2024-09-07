import { useState, useEffect, useCallback } from 'react';
import { fetchMessages, validateMessage } from '../../service/service';

export const useMessages = (socketRef, room, currentPage, setHasMoreMessages, showFeedback) => {
  const [messages, setMessages] = useState([]);  // Initialize as an empty array

  const loadMessages = useCallback(async () => {
    if (room?.name) {
      try {
        const fetchedMessages = await fetchMessages(room.name, currentPage, showFeedback);
        if (fetchedMessages) {
          if (fetchedMessages.length < 20) {
            setHasMoreMessages(false);
          }
          setMessages(prevMessages => Array.isArray(prevMessages)
            ? [...prevMessages, ...fetchedMessages]
            : fetchedMessages
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        showFeedback('Error: Failed to fetch messages', 'error');
      }
    }
  }, [room, currentPage, setHasMoreMessages, showFeedback]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const handleIncomingMessages = (data) => {
      if (data && data.username && data.message) {
        setMessages(prevMessages => Array.isArray(prevMessages) ? [...prevMessages, data] : [data]);
      } else {
        console.error('Received unexpected message format:', data);
        showFeedback('Error: Received invalid message format', 'error');
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
  }, [socketRef, showFeedback]);

  const sendMessage = useCallback((message, username) => {
    if (validateMessage(message)) {
      if (socketRef.current) {
        socketRef.current.emit('message', { roomId: room.id, message, username });
      }
    } else {
      showFeedback('Invalid message format', 'error');
    }
  }, [socketRef, room]);

  return { sendMessage, loadMessages, messages, hasMoreMessages: true };
};
