"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const db_1 = __importDefault(require("../config/db"));
const userRoutes_1 = __importDefault(require("../routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("../routes/chatRoutes"));
const messageRoute_1 = __importDefault(require("../routes/messageRoute"));
const socket_io_1 = require("socket.io");
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
const server = http_1.default.createServer(app);
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
const io = new socket_io_1.Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
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
        chat.users.forEach((user) => {
            socket.in(user).emit('message received', newMessageReceived);
        });
    });
    socket.on('typing', (sender, room) => {
        socket.in(room).emit('typing', sender);
    });
    socket.on('stop typing', (room) => {
        socket.in(room).emit('stop typing');
    });
});
module.exports = app;
