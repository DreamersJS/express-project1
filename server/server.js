import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const app = express();
app.use(express.static(path.join(__dirname, '../client')));
const expressServer = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})

const io = new Server(expressServer, {
  cors: {
    origin: 'http://localhost:5173', 
    // origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173','http://127.0.0.1:5173'],
    methods: ['GET', 'POST'], 
    credentials: true, 
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

