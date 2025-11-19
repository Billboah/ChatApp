import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRouter from "./routes/userRoutes";
import chatRouter from "./routes/chatRoutes";
import messageRouter from "./routes/messageRoute";
import { Server } from "socket.io";
import { error_handler } from "./middleware/error";
import { registerChatHandlers } from "./sockets/chatSocket";

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(express.json());

// REST routes
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.get("/", (req, res) => {
  res.send("Backend is working!");
});


// Error handler
app.use(error_handler);

// Socket setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});


registerChatHandlers(io);


const port = process.env.PORT || 5000;
httpServer.listen(port, () => console.log(`Server running on port ${port}`));
