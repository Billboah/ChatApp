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
const express_1 = require("express");
const chatModel_1 = require("../models/chatModel");
const authMiddleware_1 = require("../middleware/authMiddleware");
const messageModel_1 = require("../models/messageModel");
const router = (0, express_1.Router)();
//send a message
router.post('/', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield chatModel_1.Chat.findByIdAndUpdate(req.body.chatId, {
            $push: { unreadMessages: message },
        }, { new: true });
        res.json(message);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//get chat message
router.get('/:chatId', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const message = yield messageModel_1.Message.find({ chat: req.params.chatId })
            .populate("sender", "username pic email")
            .populate("chat");
        yield chatModel_1.Chat.findByIdAndUpdate(req.params.chatId, {
            $set: { unreadMessages: [] },
        }, { new: true });
        res.json(message);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
exports.default = router;
