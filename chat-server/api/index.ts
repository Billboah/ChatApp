import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "../config/db";
import userRouter from "../routes/userRoutes";
import chatRouter from "../routes/chatRoutes";
import messageRouter from "../routes/messageRoute";
import { Server } from "socket.io";
import { error_handler } from "../middleware/error";

dotenv.config();

connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(express.json());

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

const port = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("user connected", (userId) => {
    if (!users.has(userId)) {
      users.set(userId, socket.id);
      socket.emit("connected");
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }
  });

  //join chat room
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  //Leave chat room
  socket.on("leave chat", (room) => {
    socket.leave(room);
  });

  //Send message
  socket.on("send message", (message) => {
    const chatId = message?.chat?._id;
    if (!chatId) return;

    socket.to(chatId).emit("received message", message);
  });

  // Typing
  socket.on("typing", (sender, chatId) => {
    if (sender && chatId) {
      socket.to(chatId).emit("typing", { chatId, sender });
    }
  });

  // Stop typing
  socket.on("stop typing", (senderId, chatId) => {
    if (senderId && chatId) {
      socket.to(chatId).emit("stop typing", { chatId, senderId });
    }
  });
});

app.use(error_handler);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
