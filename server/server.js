import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
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
app.use(express.static(path.join(__dirname, "../client")));

let expressServer;

try {
  expressServer = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });

  const io = new Server(expressServer, {
    cors: {
      origin: CORS_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const namespaces = ['/chat', '/admin', '/notifications'];

  namespaces.forEach((namespace) => {
    const nsp = io.of(namespace);

    nsp.on('connection', (socket) => {
      console.log(`User connected to ${namespace} namespace: ${socket.id}`);

      if (namespace === '/chat') {
        
        socket.on('joinRoom', (room) => {
          socket.join(room);
          socket.to(room).emit('message', `${socket.id.substring(0, 5)} joined ${room} room in chat namespace`);
        });

        socket.emit("message", "Welcome to the chat!");
        socket.broadcast.emit("message", `${socket.id.substring(0, 5)} joined the chat`);

        socket.on('message', (data) => {
          const { room, message } = data;
          nsp.to(room).emit('message', `${socket.id.substring(0, 5)}: ${message}`);
        });

        socket.on('typing', () => {
          socket.broadcast.emit('typing', socket.id.substring(0, 5));
        });

        socket.on('stopTyping', () => {
          socket.broadcast.emit('stopTyping', socket.id.substring(0, 5));
        });

      } else if (namespace === '/admin') {
        socket.on('adminMessage', (data) => {
          console.log(`Admin Message: ${data}`);
          nsp.emit('adminMessage', `${socket.id.substring(0, 5)}: ${data}`);
        });

      } else if (namespace === '/notifications') {
        socket.on('notify', (data) => {
          console.log(`Notification: ${data}`);
          nsp.emit('notify', data);
        });
      }

      socket.on('disconnect', () => {
        console.log(`User disconnected from ${namespace} namespace`);
      });
    });
  });

} catch (error) {
  console.error("Error starting the server:", error);
  process.exit(1);
}

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.stack || err.message);
  shutdownGracefully();
});

// Handle unhandled promise rejections
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

    // If server doesn't shut down gracefully in 10 seconds, force exit.
    setTimeout(() => {
      console.error("Forcing server shutdown.");
      process.exit(1);
    }, 10000).unref(); // unref to allow the process to exit if no more async work is pending.
  }
};

// Handle SIGTERM and SIGINT signals for graceful shutdown
process.on("SIGTERM", shutdownGracefully);
process.on("SIGINT", shutdownGracefully);
