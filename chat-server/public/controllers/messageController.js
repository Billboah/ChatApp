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
exports.getChatMessages = exports.sendMessage = void 0;
const chatModel_1 = require("../models/chatModel");
const messageModel_1 = require("../models/messageModel");
const userModels_1 = require("../models/userModels");
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }
    const newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        delivered: true,
    };
    try {
        const message = yield messageModel_1.Message.create(newMessage);
        yield message.populate('sender', 'username pic email');
        yield message.populate('chat');
        yield userModels_1.User.populate(message.chat, {
            path: 'users',
            select: 'username pic email selectedChat unreadMessages',
        });
        yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        });
        const chat = yield chatModel_1.Chat.findOne({ _id: chatId });
        const usersInChat = chat.users;
        yield userModels_1.User.updateMany({
            _id: { $in: usersInChat },
            selectedChat: { $ne: chatId },
        }, {
            $push: { 'unreadMessages': message },
        }, {
            new: true,
        });
        res.json(message);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.sendMessage = sendMessage;
const getChatMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chatId = req.params.chatId;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!chatId) {
        return;
    }
    try {
        const messageIdsToRemove = yield messageModel_1.Message.find({ chat: chatId }).distinct('_id');
        if (userId) {
            const message = yield messageModel_1.Message.find({ chat: chatId })
                .populate("sender", "username pic email")
                .populate({
                path: "chat",
                populate: {
                    path: "users",
                    select: "username pic email selectedChat unreadMessages",
                },
            });
            yield userModels_1.User.findByIdAndUpdate(userId, {
                $pull: {
                    unreadMessages: {
                        $in: messageIdsToRemove
                    }
                },
            }, { new: true });
            res.json(message);
        }
        else {
            res.status(400).json({ error: 'User does not exist' });
        }
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});
exports.getChatMessages = getChatMessages;
