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
          console.log(`Socket ${socket.id} attempting to join room: ${roomName}`);

          // Check if the room already exists
          const [existingRooms] = await db.query('SELECT id FROM rooms WHERE name = ?', [roomName]);
          let roomId;

          if (existingRooms.length > 0) {
              // Room already exists
              roomId = existingRooms[0].id;
              console.log(`Room exists. Socket ${socket.id} joining room: ${roomId}`);
          } else {
              // Create a new room
              roomId = uuidv4();
              await db.query('INSERT INTO rooms (id, name) VALUES (?, ?)', [roomId, roomName]);
              console.log(`Created new room ${roomId}. Socket ${socket.id} joining room.`);
          }

          // Join the room
          socket.join(roomId);
          socket.emit('roomCreated', { roomId, roomName });

          // Notify the room of the new user
          chatNsp.to(roomId).emit('message', { username: 'System', message: `${username || socket.id} has joined the room ${roomName}` });

      } catch (error) {
          console.error(`Error during room join process for socket ${socket.id}:`, error);
          socket.emit('error', { message: 'Failed to join room' });
      }
  });

  socket.on('leaveRoom', async (roomId) => {
      try {
          if (roomId) {
              socket.leave(roomId);
              console.log(`Socket ${socket.id} left room: ${roomId}`);
              chatNsp.to(roomId).emit('message', {
                  username: 'System',
                  message: `${username || 'Anonymous'} has left the room.`
              });
          } else {
              console.log(`Socket ${socket.id} attempted to leave a room without providing roomId.`);
          }
      } catch (error) {
          console.error(`Error during room leave process for socket ${socket.id}:`, error);
          socket.emit('error', { message: 'Failed to leave room' });
      }
  });


  socket.on('message', async (data) => {
    const { roomId, message, username } = data;
    const checkRoomExists = async (roomId) => {
      const [rows] = await db.query('SELECT id FROM rooms WHERE id = ?', [roomId]);
      return rows.length > 0;
    };
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      console.log('Invalid message:', message);
      return;
    }

    const messageWithUsername = { username: username || 'Anonymous', message };

    if (roomId) {
      if (await checkRoomExists(roomId)) {
        const messageId = uuidv4();
        try {
          chatNsp.to(roomId).emit('message', messageWithUsername);
          await db.query('INSERT INTO messages (id, room_id, username, message) VALUES (?, ?, ?, ?)', [messageId, roomId, username, message]);
          console.log('Message inserted successfully');
        } catch (error) {
          console.error('Database insert error:', error);
        }
      } else {
        console.error('Room does not exist:', roomId);
      }
    } else {
      chatNsp.emit('message', messageWithUsername);
    }
  });
  


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
