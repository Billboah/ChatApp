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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatMessages = exports.sendMessageController = void 0;
const chatModel_1 = require("../models/chatModel");
const messageModel_1 = require("../models/messageModel");
const userModels_1 = require("../models/userModels");
const sendMessageController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }
    try {
        const newMessage = yield messageModel_1.Message.create({
            sender: req.user._id,
            content: content,
            chat: chatId,
            delivered: true,
        });
        const message = yield messageModel_1.Message.findById(newMessage._id)
            .populate('sender', 'username pic email')
            .populate('chat')
            .populate({
            path: 'chat.users',
            select: 'username pic email',
        });
        yield chatModel_1.Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        });
        const usersInChat = yield userModels_1.User.find({ selectedChat: chatId });
        yield chatModel_1.Chat.updateMany({
            _id: chatId,
            'users': { $nin: usersInChat.map((user) => user._id) },
        }, {
            $push: { unreadMessages: message },
        }, { new: true });
        res.json(message);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.sendMessageController = sendMessageController;
const getChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = req.params.chatId;
    const userId = req.user._id;
    try {
        if (chatId === 'chatIsNotSelected') {
            yield userModels_1.User.findByIdAndUpdate(userId, {
                $set: { selectedChat: null },
            }, { new: true });
        }
        else {
            const message = yield messageModel_1.Message.find({ chat: chatId })
                .populate("sender", "username pic email")
                .populate("chat");
            yield userModels_1.User.findByIdAndUpdate(userId, {
                $set: { selectedChat: chatId },
            }, { new: true });
            yield chatModel_1.Chat.updateMany({
                _id: chatId,
                'users': { $in: [userId] },
            }, {
                $set: { unreadMessages: [] },
            }, { new: true });
            res.json(message);
        }
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.getChatMessages = getChatMessages;
