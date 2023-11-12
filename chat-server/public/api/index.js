"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("../config/db"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("../routes/chatRoutes"));
const messageRoute_1 = __importDefault(require("../routes/messageRoute"));
const socket_io_1 = require("socket.io");
const userModels_1 = require("../models/userModels");
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use('/api/user', userRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/message', messageRoute_1.default);
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
const io = new socket_io_1.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'https://chatapp-amber-rho.vercel.app',
    },
});
io.on('connection', (socket) => {
    console.log('Connected to socket.io');
    var userId;
    socket.on("setup", (userData) => {
        userId = userData === null || userData === void 0 ? void 0 : userData._id;
        socket.join(userData === null || userData === void 0 ? void 0 : userData.id);
        socket.emit("connected");
    });
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log(userId + ' ' + "Joined Room:" + ' ' + room);
    });
    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;
        if (!chat.users) {
            return;
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
    socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield userModels_1.User.findByIdAndUpdate(userId, {
                $set: { selectedChat: null },
            }, { new: true });
        }
        catch (error) {
            console.log({ error: error.message });
        }
    }));
});
module.exports = app;
