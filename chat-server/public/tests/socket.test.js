"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const socket_io_client_1 = require("socket.io-client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe("Socket.IO Chat Server", () => {
    let io, serverSocket, clientSocket, httpServer;
    beforeAll((done) => {
        httpServer = (0, http_1.createServer)();
        io = new socket_io_1.Server(httpServer);
        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
                auth: {
                    // Create a test token - make sure JWT_SECRET is set in env
                    token: jsonwebtoken_1.default.sign({ id: "test-user-id" }, process.env.JWT_SECRET || "test-secret"),
                },
            });
            io.on("connection", (socket) => {
                serverSocket = socket;
            });
            clientSocket.on("connect", done);
        });
    });
    afterAll(() => {
        io.close();
        clientSocket.close();
        httpServer.close();
    });
    test("should handle basic socket connection", (done) => {
        clientSocket.on("connected", (data) => {
            expect(data).toBeDefined();
            done();
        });
    });
    test("should handle join chat event", (done) => {
        const chatId = "test-chat-123";
        // Mock User.findByIdAndUpdate since we're not connecting to real DB in tests
        jest.mock("../models/userModels", () => ({
            User: {
                findByIdAndUpdate: jest.fn().mockResolvedValue(true),
            },
        }));
        clientSocket.emit("join chat", chatId);
        // Wait briefly to ensure join completes
        setTimeout(() => {
            expect(serverSocket.rooms.has(chatId)).toBeTruthy();
            done();
        }, 50);
    });
    test("should handle send/receive message flow", (done) => {
        const chatId = "test-chat-123";
        const messageContent = "Test message";
        // Listen for received message (broadcast)
        clientSocket.on("message sent", (msg) => {
            expect(msg).toBeDefined();
            expect(msg.content).toBe(messageContent);
            done();
        });
        // Send a test message
        clientSocket.emit("send message", {
            content: messageContent,
            chatId: chatId,
        });
    });
});
