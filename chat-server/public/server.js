"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const messageRoute_1 = __importDefault(require("./routes/messageRoute"));
const socket_io_1 = require("socket.io");
const error_1 = require("./middleware/error");
const chatSocket_1 = require("./sockets/chatSocket");
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
}));
app.use(express_1.default.json());
// REST routes
app.use("/api/user", userRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
app.use("/api/message", messageRoute_1.default);
// Error handler
app.use(error_1.error_handler);
// Socket setup
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    },
});
(0, chatSocket_1.registerChatHandlers)(io);
const port = process.env.PORT || 5000;
httpServer.listen(port, () => console.log(`Server running on port ${port}`));
