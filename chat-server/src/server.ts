import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import userRouter from '../routes/userRoutes';
import chatRouter from '../routes/chatRoutes';
import messageRouter from '../routes/messageRoute';
import { Server } from "socket.io";
import { User } from "../models/userModels";


dotenv.config();


connectDB()
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())

app.use('/api/user', userRouter)

app.use('/api/chat', chatRouter)

app.use('/api/message', messageRouter)

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
})

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3001',
  },
});


io.on('connection', (socket) => {
  console.log('Connected to socket.io');
  var userId: string


  socket.on("setup", (userData) => {
    userId = userData?._id
    socket.join(userData?.id)
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room)
    console.log(userId + ' ' + "Joined Room:" + ' ' + room);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat

    if (!chat.users) {
      return
    }

    const recipients = chat.users.filter((user) => user._id !== newMessageReceived.sender._id);

    recipients.forEach((user) => {
      socket.in(user).emit('message received', newMessageReceived, (error) => {
        if (error) {
          console.error(`Error sending message to room ${user}:`, error);
        }
      });
    });
    
  });

  socket.on('typing', (sender, room) => {
    socket.in(room).emit('typing', sender);
  });


  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing');
  });

  // socket.off('setup', (userData)=>{
  //   console.log('USER DISCONNECTED')
  //   Socket.leave(userData._id)
  // })

  socket.on('disconnect', async () => {
    try {
      await User.findByIdAndUpdate(
        userId,
        {
          $set: {selectedChat: null},
        },
        { new: true }
      );
    }catch(error){
      console.log({ error: error.message });
    }
  });

})





module.exports = app;
