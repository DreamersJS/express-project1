import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from './userRoutes.js';
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const NODE_ENV = process.env.NODE_ENV || "development";
const parseOrigins = (origins) =>
  origins.split(",").map((origin) => origin.trim());
const isCORSDisabled = process.env.CORS_ORIGIN_PROD === "false";
const CORS_ORIGIN =
  NODE_ENV === "production"
    ? isCORSDisabled
      ? false
      : process.env.CORS_ORIGIN_PROD
    : parseOrigins(process.env.CORS_ORIGIN_DEV);

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "../client")));

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
});

let expressServer;

try {
  expressServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });

  const io = new Server(expressServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const chatNsp = io.of('/chat');

  chatNsp.on('connection', (socket) => {
    socket.emit('message', 'Welcome to chat app!');

    socket.on('joinRoom', (room) => {
      socket.join(room);
      chatNsp.to(room).emit('message', `User ${socket.id} joined ${room}`);
    });

    socket.on('message', (data) => {
      const { room, message } = data;
    
      if (!message || typeof message !== 'string' || !message.trim()) {
        console.log('Invalid message:', message);
        return;
      }
    
      if (room) {
        chatNsp.to(room).emit('message', `${socket.id.substring(0, 5)}: ${message}`);
      } else {
        chatNsp.emit('message', `${socket.id.substring(0, 5)}: ${message}`);
      }
    });

    socket.on('typing', () => {
      if (room) {
        chatNsp.to(room).broadcast.emit('typing', socket.id.substring(0, 5));
      } else {
        chatNsp.broadcast.emit('typing', socket.id.substring(0, 5));
      }
    });

    socket.on('stopTyping', () => {
      socket.broadcast.emit('stopTyping', socket.id.substring(0, 5));
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from /chat:', socket.id);
    });
  });

} catch (error) {
  console.error("Error starting the server:", error);
  process.exit(1);
}

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.stack || err.message);
  shutdownGracefully();
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  shutdownGracefully();
});

// Graceful shutdown
const shutdownGracefully = () => {
  if (expressServer) {
    expressServer.close(() => {
      console.log("Closed remaining connections.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forcing server shutdown.");
      process.exit(1);
    }, 10000).unref();
  }
};

process.on("SIGTERM", shutdownGracefully);
process.on("SIGINT", shutdownGracefully);
