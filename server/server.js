import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './userRoutes.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

dotenv.config(); // Load environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const NODE_ENV = process.env.NODE_ENV || 'development';
const parseOrigins = (origins) => origins.split(',').map((origin) => origin.trim());
const isCORSDisabled = process.env.CORS_ORIGIN_PROD === 'false';
const CORS_ORIGIN =
  NODE_ENV === 'production'
    ? isCORSDisabled
      ? false
      : process.env.CORS_ORIGIN_PROD
    : parseOrigins(process.env.CORS_ORIGIN_DEV);

// Initialize Express
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

app._router.stack.forEach(middleware => {
  if (middleware.route) {
    console.log(middleware.route);
  }
});

let expressServer;

try {
  expressServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });

  const io = new Server(expressServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const chatNsp = io.of('/chat');

  chatNsp.on('connection', (socket) => {
    const username = socket.handshake.query.username; // Retrieve username

    console.log('New client connected:', socket.id);

    socket.emit('message', { username: 'System', message: 'Welcome to chat app!' });

    // Create a new room and join it
    socket.on('joinRoom', async (roomName) => {

      try {
        // Check if the room already exists
        const [existingRooms] = await db.query('SELECT id FROM rooms WHERE name = ?', [roomName]);

        if (existingRooms.length > 0) {
          // Room already exists
          const roomId = existingRooms[0].id;
          socket.join(roomId); // Join the existing room
          socket.emit('roomCreated', { roomId, roomName, message: 'Room already exists' }); // Notify client
          chatNsp.to(roomId).emit('message', { username: 'System', message: `${username || socket.id} has joined the room ${roomName}` });
          return;
        }

        // Create a new room if it doesn't exist
        const roomId = uuidv4();
        await db.query('INSERT INTO rooms (id, name) VALUES (?, ?)', [roomId, roomName]);

        socket.join(roomId);
        socket.emit('roomCreated', { roomId, roomName });
        console.log('Room created and socket joined:', roomId);

      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    // Handle the 'leaveRoom' event
    socket.on('leaveRoom', async (roomId) => {
      try {
        if (roomId) {
          socket.leave(roomId); // Remove the socket from the specified room
          console.log(`Socket ${socket.id} left room: ${roomId}`);

          chatNsp.to(roomId).emit('message', {
            username: 'System',
            message: `${username || 'Anonymous'} has left the room.`
          });
        } else {
          console.log('No roomId provided to leave.');
        }
      } catch (error) {
        console.error('Error leaving room:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    socket.on('message', async (data) => {
      console.log('socket.on message hit');
      const { roomId, message, username } = data;
      console.log('message room:', roomId);

      if (!message || typeof message !== 'string' || !message.trim()) {
        console.log('Invalid message:', message);
        return;
      }

      const messageWithUsername = { username: username || 'Anonymous', message };

      if (roomId) {
        const messageId = uuidv4();
        await db.query('INSERT INTO messages (id, room_id, username, message) VALUES (?, ?, ?, ?)', [messageId, roomId, username, message]);
        chatNsp.to(roomId).emit('message', { username: username || 'Anonymous', message });
      } else {
        chatNsp.emit('message', messageWithUsername);
      }
    });

    // socket.on('typing', () => {
    //   const room = Array.from(socket.rooms).find(r => r !== socket.id);
    //   if (room) {
    //     socket.broadcast.to(room).emit('typing', username);
    //   }
    // });

    // socket.on('stopTyping', () => {
    //   const room = Array.from(socket.rooms).find(r => r !== socket.id);
    //   if (room) {
    //     socket.broadcast.to(room).emit('stopTyping', username);
    //   }
    // });


    socket.on('disconnect', () => {
      console.log('User disconnected from /chat:', socket.id);
    });
  });

} catch (error) {
  console.error('Error starting the server:', error);
  process.exit(1);
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.stack || err.message);
  shutdownGracefully();
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdownGracefully();
});

// Graceful shutdown
const shutdownGracefully = () => {
  if (expressServer) {
    expressServer.close(() => {
      console.log('Closed remaining connections.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forcing server shutdown.');
      process.exit(1);
    }, 10000).unref();
  }
};

process.on('SIGTERM', shutdownGracefully);
process.on('SIGINT', shutdownGracefully);
