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
exports.addMemberController = exports.removeMemberController = exports.changeGroupIconController = exports.changeGroupNameController = exports.createGroupChatController = exports.getAllChatController = exports.createChatController = void 0;
const chatModel_1 = require("../models/chatModel");
const userModels_1 = require("../models/userModels");
//create individual chat
const createChatController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            throw new Error("Select a user to start a new chat chat");
        }
        const currentUser = req.user;
        const targetUser = yield userModels_1.User.findById(userId);
        if (!targetUser) {
            throw new Error("Target user not found");
        }
        const isChat = yield chatModel_1.Chat.find({
            isGroupChat: false,
            users: { $all: [currentUser._id, targetUser._id] },
        });
        //if chat is available
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
            //if chat is not available, create a new one
            const chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [currentUser._id, targetUser._id],
            };
            const createdChat = yield chatModel_1.Chat.create(chatData);
            const fullChat = yield chatModel_1.Chat.findOne({ _id: createdChat._id })
                .populate("users", "username pic email")
                .populate({
                path: "latestMessage",
                populate: {
                    path: "sender",
                    select: "username email",
                },
            });
            if (fullChat) {
                return res
                    .status(200)
                    .send(Object.assign(Object.assign({}, fullChat.toObject()), { unreadMessages: [] }));
            }
            else {
                throw new Error("Failed to create and fetch the chat");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.createChatController = createChatController;
//get all chat
const getAllChatController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield chatModel_1.Chat.find({ users: req.user._id })
            .populate("users", "username pic email")
            .populate("groupAdmin", "username pic email")
            .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "username email",
            },
        })
            .sort({ updatedAt: -1 });
        const unread_messages = yield userModels_1.User.findById(req.user._id)
            .select("unreadMessages")
            .populate({ path: "unreadMessages", select: "chat" });
        const populatedChat = results.map((chat) => {
            // Find unread messages for this chat
            const chat_unread_messages = unread_messages.unreadMessages.filter((message) => message.chat._id.toString() === chat._id.toString());
            // Add unread messages to the chat
            return Object.assign(Object.assign({}, chat.toObject()), { unreadMessages: chat_unread_messages });
        });
        res.status(200).json(populatedChat);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllChatController = getAllChatController;
//create a group chat
const createGroupChatController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.users || !req.body.name) {
            res.status(400);
            throw new Error("Please fill all necessary fields");
        }
        const users = JSON.parse(req.body.users);
        if (users.length < 2) {
            res.status(400);
            throw new Error("More than 2 users are required to form a group chat");
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
            .populate("users", "username pic email")
            .populate("groupAdmin", "username pic email")
            .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "username email",
            },
        });
        if (fullGroupChat) {
            return res
                .status(200)
                .send(Object.assign(Object.assign({}, fullGroupChat.toObject()), { unreadMessages: [] }));
        }
        else {
            throw new Error("Failed to create and fetch the the group chat");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.createGroupChatController = createGroupChatController;
//change group name
const changeGroupNameController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, chatName } = req.body;
        const updatedChat = yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
            chatName,
        }, {
            new: true,
        })
            .populate("users", "username pic email")
            .populate("groupAdmin", "username pic email");
        if (!updatedChat) {
            throw new Error("Chat Not Found");
        }
        res.json(updatedChat);
    }
    catch (error) {
        next(error);
    }
});
exports.changeGroupNameController = changeGroupNameController;
//change group icon
const changeGroupIconController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, pic } = req.body;
        const updatedChat = yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
            pic,
        }, {
            new: true,
        })
            .populate("users", "username pic email")
            .populate("groupAdmin", "username pic email");
        if (!updatedChat) {
            throw new Error("Chat Not Found");
        }
        res.json(updatedChat);
    }
    catch (error) {
        next(error);
    }
});
exports.changeGroupIconController = changeGroupIconController;
//remove a group member
const removeMemberController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const chat = yield chatModel_1.Chat.findOne({ _id: chatId });
        if (chat.groupAdmin.toString() === req.user._id.toString()) {
            const removedChat = yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
                $pull: { users: userId },
            }, { new: true })
                .populate("users", "username pic email")
                .populate("groupAdmin", "username pic email");
            if (!removedChat) {
                throw new Error("Chat Not Found");
            }
            res.json(removedChat);
        }
        else {
            res.status(400);
            throw new Error("You are not authorized to perform this function");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.removeMemberController = removeMemberController;
//add a group member/members
const addMemberController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = JSON.parse(req.body.userIds);
        const chatId = req.body.chatId;
        const chat = yield chatModel_1.Chat.findOne({ _id: chatId });
        if (chat.groupAdmin.toString() === req.user._id.toString()) {
            const addedChat = yield chatModel_1.Chat.findByIdAndUpdate(chatId, {
                $push: { users: users },
            }, { new: true })
                .populate("users", "username pic email")
                .populate("groupAdmin", "username pic email");
            if (!addedChat) {
                return res.status(404).send("Chat Not Found");
            }
            res.json(addedChat);
        }
        else {
            throw new Error("You are not authorized to perform this function");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.addMemberController = addMemberController;
