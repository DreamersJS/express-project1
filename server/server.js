import { createServer } from 'http';
import { Server } from 'socket.io';
// import express from 'express';

// const app = express();
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Allow requests from Vite's development server
    methods: ['GET', 'POST'], // Define the HTTP methods allowed
    credentials: true, // Allow credentials if needed
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('message', (data) => {
    console.log(data);
    io.emit('message', `${socket.id.substring(0, 5)}: ${data}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

httpServer.listen(3500, () => {
  console.log('Listening on port 3500');
});
