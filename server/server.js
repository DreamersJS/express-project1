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

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // emit a message to only the client that just connected
    socket.emit("message", "Welcome to the chat!");
    // broadcast a message to all clients except the one that just connected
    socket.broadcast.emit("message", `${socket.id.substring(0, 5)} joined the chat`);

    socket.on("message", (data) => {
      io.emit("message", `${socket.id.substring(0, 5)}: ${data}`);
    });

    socket.on('typing', () => {
      socket.broadcast.emit('typing', socket.id.substring(0, 5));
    });
    
    socket.on('stopTyping', () => {
      socket.broadcast.emit('stopTyping', socket.id.substring(0, 5));
    });
    
    socket.on("disconnect", () => {
      socket.broadcast.emit("message", `${socket.id.substring(0, 5)} left the chat`);
      console.log("User disconnected");
    });
  });

} catch (error) {
  console.error("Error starting the server:", error);
  process.exit(1);
}

// Handle uncaught exceptions
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
