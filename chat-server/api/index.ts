import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "../config/db";
import userRouter from "../routes/userRoutes";
import chatRouter from "../routes/chatRoutes";
import messageRouter from "../routes/messageRoute";
import { Server } from "socket.io";

dotenv.config();

connectDB();

const app = express();
app.use(cors());
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
    if (users.has(userId)) {
      const previousSocketId = users.get(userId);
      io.sockets.sockets.get(previousSocketId)?.disconnect(); // Disconnect the previous socket
    }
    users.set(userId, socket.id);
    socket.emit("connected");
  });

  socket.on("disconnect", () => {
    users.forEach((id, userId) => {
      if (id === socket.id) {
        users.delete(userId);
      }
    });
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("send message", (messageReceived) => {
    const chat = messageReceived.chat;

    if (!chat.users) return;

    chat.users.forEach((user: any) => {
      if (user._id === messageReceived.sender._id) return;

      const recipientSocketId = users.get(user._id);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("received message", messageReceived);
      }
    });
  });

  socket.on("typing", (sender, room) => {
    socket.to(room).emit("typing", sender);
  });

  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing");
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(` ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
