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
exports.getUnreadMessages = exports.getChatMessages = void 0;
const messageModel_1 = require("../models/messageModel");
const userModels_1 = require("../models/userModels");
//get all messages
const getChatMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = req.params.chatId;
    const userId = req === null || req === void 0 ? void 0 : req.user._id;
    const { lastMessageId } = req.query;
    const limit = 20;
    if (!chatId) {
        throw new Error("Chat ID is required");
    }
    if (!userId) {
        throw new Error("User does not exist");
    }
    try {
        const user = yield userModels_1.User.findById(userId);
        const unreadMessageIds = user.unreadMessages;
        // Fetch unread messages first
        const unreadMessages = yield messageModel_1.Message.find({
            chat: chatId,
            _id: { $in: unreadMessageIds },
        })
            .sort({ updatedAt: -1 })
            .populate("sender", "username pic email")
            .populate({
            path: "chat",
            populate: {
                path: "users",
                select: "username pic email selectedChat unreadMessages",
            },
        })
            .exec();
        let filter = {
            chat: chatId,
            _id: { $nin: unreadMessageIds }, // Exclude unread messages
        };
        // If lastMessageId is provided, filter for older messages
        if (lastMessageId) {
            filter["_id"] = { $lt: lastMessageId };
        }
        // Fetch regular messages with pagination
        const regularMessages = yield messageModel_1.Message.find(filter)
            .sort({ _id: -1 })
            .limit(limit)
            .populate("sender", "username pic email")
            .populate({
            path: "chat",
            populate: {
                path: "users",
                select: "username pic email selectedChat unreadMessages",
            },
        })
            .exec();
        // Remove fetched unread messages from user's unreadMessages
        const fetchedUnreadMessageIds = unreadMessages.map((msg) => msg._id.toString());
        user.unreadMessages = unreadMessageIds.filter((id) => !fetchedUnreadMessageIds.includes(id.toString()));
        yield user.save();
        if (unreadMessages && unreadMessages.length > 0) {
            res.json({
                unreadMessages: [...unreadMessages].reverse(),
                regularMessages: [...regularMessages].reverse(),
            });
        }
        else {
            res.json({
                unreadMessages: [],
                regularMessages: [...regularMessages].reverse(),
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getChatMessages = getChatMessages;
//get unread message only
const getUnreadMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = req.params.chatId;
    const userId = req === null || req === void 0 ? void 0 : req.user._id;
    if (!chatId) {
        throw new Error("Chat ID is required");
    }
    try {
        const user = yield userModels_1.User.findById(userId);
        const unreadMessageIds = user.unreadMessages;
        const unreadMessages = yield messageModel_1.Message.find({
            _id: { $in: unreadMessageIds },
            chat: { $in: chatId },
        })
            .populate("sender", "username pic email")
            .populate({
            path: "chat",
            populate: {
                path: "users",
                select: "username pic email selectedChat unreadMessages",
            },
        })
            .exec();
        const fetchedUnreadMessageIds = unreadMessages.map((msg) => msg._id.toString());
        user.unreadMessages = unreadMessageIds.filter((id) => !fetchedUnreadMessageIds.includes(id.toString()));
        yield user.save();
        res.json(unreadMessages.reverse());
    }
    catch (error) {
        next(error);
    }
});
exports.getUnreadMessages = getUnreadMessages;
