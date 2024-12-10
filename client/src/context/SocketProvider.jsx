import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { AppContext } from '../AppContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Create the context
const SocketContext = createContext();

export function SocketProvider({ children }) {
    const socketRef = useRef(null);
    const { user } = useContext(AppContext);

    useEffect(() => {
        if (!SOCKET_URL) {
            console.error('Socket URL is undefined');
            return;
        }

        socketRef.current = io(`${SOCKET_URL}/chat`, {
            transports: ['websocket'],
            query: { username: user?.username || 'Anonymous' }
        });

        socketRef.current.on('connect', () => {
            console.log(`Connected to /chat with ID: ${socketRef.current.id}`);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket.IO connection error:', err);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log('Socket.IO Client disconnected');
            }
        };
    }, [SOCKET_URL, user]);

    /*By providing these methods (sendEvent, onEvent, offEvent) inside your context, you abstract the details of socketRef.current. This ensures that child components interact with the socket without needing direct access to socketRef.current.
  This encapsulation makes your API cleaner and easier to maintain.*/
    const sendEvent = (eventName, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(eventName, data);
        } else {
            console.warn('Socket is not connected. Event not sent.');
        }
    };


    const onEvent = (eventName, callback) => {
        socketRef.current.on(eventName, callback);
    };

    const offEvent = (eventName, callback) => {
        socketRef.current.off(eventName, callback);
    };

    return (
        <SocketContext.Provider value={{ sendEvent, onEvent, offEvent, socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
