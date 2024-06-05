import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "../config/db";
import userRouter from "../routes/userRoutes";
import chatRouter from "../routes/chatRoutes";
import messageRouter from "../routes/messageRoute";
import { Server } from "socket.io";
import { User } from "../models/userModels";

dotenv.config();

connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

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

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  var userId: string;

  socket.on("setup", (userData) => {
    userId = userData?._id;
    socket.join(userData?.id);
    socket.emit("connected");
    console.log(`${userId} has log in and join a private room`);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(userId + " " + "Joined Room:" + " " + room);
  });

  socket.on("send message", (messageReceived) => {
    const chat = messageReceived.chat;

    if (!chat.users) return;

    chat.users.forEach((user: any) => {
      if (user._id === messageReceived.sender._id) return;

      socket.in(user._id).emit("received message", messageReceived);
    });
  });

  socket.on("typing", (sender, room) => {
    socket.in(room).emit("typing", sender);
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("disconnect", async () => {
    const userId = socket.handshake.query.userId;
    if (!userId) return;
    try {
      await User.findByIdAndUpdate(
        userId,
        {
          $set: { selectedChat: null },
        },
        { new: true }
      );
    } catch (error: any) {
      console.log({ error: error.message });
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
