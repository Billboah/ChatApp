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
const userModels_1 = require("../models/userModels");
const router = (0, express_1.Router)();
//create a one to one chat
router.post('/', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            console.log('UserId param not sent with request');
            return res.sendStatus(400);
        }
        const currentUser = req.user;
        const targetUser = yield userModels_1.User.findById(userId);
        if (!targetUser) {
            console.log('Target user not found');
            return res.sendStatus(404);
        }
        const isChat = yield chatModel_1.Chat.find({
            isGroupChat: false,
            users: { $all: [currentUser._id, targetUser._id] },
        })
            .populate('users', '-password')
            .populate('latestMessage')
            .populate('unreadMessages')
            .populate('latestMessage.sender', 'username pic email');
        if (isChat.length > 0) {
            return res.send({
                chat: isChat[0],
                currentUser: {
                    username: currentUser.username,
                    pic: currentUser.pic,
                    email: currentUser.email,
                },
                targetUser: {
                    username: targetUser.username,
                    pic: targetUser.pic,
                    email: targetUser.email,
                },
            });
        }
        else {
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [currentUser._id, targetUser._id],
            };
            const createdChat = yield chatModel_1.Chat.create(chatData);
            const fullChat = yield chatModel_1.Chat.findById(createdChat._id)
                .populate('users', '-password')
                .populate('latestMessage')
                .populate('latestMessage.sender', 'username pic email');
            if (fullChat) {
                return res.status(200).send({
                    chat: fullChat,
                    currentUser: {
                        username: currentUser.username,
                        pic: currentUser.pic,
                        email: currentUser.email,
                    },
                    targetUser: {
                        username: targetUser.username,
                        pic: targetUser.pic,
                        email: targetUser.email,
                    },
                });
            }
            else {
                return res.status(500).send('Failed to create and fetch the chat');
            }
        }
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//get all chats
router.get('/', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield chatModel_1.Chat.find({ users: req.user._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .populate('unreadMessages')
            .sort({ updatedAt: -1 });
        const populatedResults = yield userModels_1.User.populate(results, {
            path: 'latestMessage.sender',
            select: 'username pic email',
        });
        res.status(200).json(populatedResults);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//create a group chat
router.post('/group', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.users || !req.body.name) {
            res.status(400);
            throw new Error('Please fill all fields');
        }
        const users = JSON.parse(req.body.users);
        if (users.length < 2) {
            res.status(400);
            throw new Error('More than 2 users are required to form a group chat');
        }
        users.push(req.user);
        const groupChat = yield chatModel_1.Chat.create({
            chatName: req.body.name,
            pic: req.body.pic,
            users: users,
            groupAdmin: req.user._id,
            isGroupChat: true,
        });
        const fullGroupChat = yield chatModel_1.Chat.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('unreadMessages')
            .populate('latestMessage');
        res.status(200).json(fullGroupChat);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//change chat name
router.put('/rename', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, chatName } = req.body;
        const updatedChat = yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
            chatName,
        }, {
            new: true,
        })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');
        if (!updatedChat) {
            return res.status(400).send('Chat Not Found');
        }
        res.json(updatedChat);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//change chat icon
router.put('/changeicon', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, pic } = req.body;
        const updatedChat = yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
            pic,
        }, {
            new: true,
        })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');
        if (!updatedChat) {
            return res.status(400).send('Chat Not Found');
        }
        res.json(updatedChat);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//remove a member from group chat
router.put('/groupremove', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const chat = yield chatModel_1.Chat.findOne({ _id: chatId });
        if (chat.groupAdmin != req.user.id) {
            res.status(400);
            throw new Error('You are not authorized to perform this function');
        }
        else {
            const removedChat = yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
                $pull: { users: userId },
            }, { new: true })
                .populate('users', '-password')
                .populate('groupAdmin', '-password');
            if (!removedChat) {
                return res.status(400).send('Chat Not Found');
            }
            res.json(removedChat);
        }
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
//add member to group chat
router.put('/groupadd', authMiddleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = JSON.parse(req.body.userIds);
        const chatId = req.body.chatId;
        const chat = yield chatModel_1.Chat.findOne({ _id: chatId });
        if (chat.groupAdmin != req.user.id) {
            throw new Error('You are not authorized to perform this function');
        }
        else {
            const addedChat = yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
                $push: { users: users },
            }, { new: true })
                .populate('users', '-password')
                .populate('groupAdmin', '-password');
            if (!addedChat) {
                return res.status(404).send('Chat Not Found');
            }
            res.json(addedChat);
        }
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
}));
exports.default = router;
