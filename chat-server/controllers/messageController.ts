import { NextFunction, Response } from "express";
import { Message } from "../models/messageModel";
import { User } from "../models/userModels";
import { CustomRequest } from "../config/express";

//get all messages
export const getChatMessages = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const chatId = req.params.chatId;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user._id;
  const { lastMessageId } = req.query;
  const limit = 20;
  if (!chatId) {
    throw new Error("Chat ID is required");
  }

  if (!userId) {
    throw new Error("User does not exist");
  }

  try {
    const user = await User.findById(userId);

    const unreadMessageIds = user.unreadMessages;

    // Fetch unread messages first
    const unreadMessages = await Message.find({
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

    let filter: any = {
      chat: chatId,
      _id: { $nin: unreadMessageIds }, // Exclude unread messages
    };

    // If lastMessageId is provided, filter for older messages
    if (lastMessageId) {
      filter["_id"] = { $lt: lastMessageId };
    }

    // Fetch regular messages with pagination. Fetch one extra to detect if there are more.
    const regularMessagesRaw = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("sender", "username pic email")
      .populate({
        path: "chat",
        populate: {
          path: "users",
          select: "username pic email selectedChat unreadMessages",
        },
      })
      .exec();

    // Determine if there are more messages beyond this page
    const hasMore = regularMessagesRaw.length > limit;

    // Trim to the requested page size
    const regularMessages = hasMore
      ? regularMessagesRaw.slice(0, limit)
      : regularMessagesRaw;
    // Remove fetched unread messages from user's unreadMessages
    const fetchedUnreadMessageIds = unreadMessages.map((msg) =>
      msg._id.toString()
    );

    user.unreadMessages = unreadMessageIds.filter(
      (id: string) => !fetchedUnreadMessageIds.includes(id.toString())
    );
    await user.save();

    // Ensure uniqueness just in case (dedupe by _id)
    const dedupe = (arr: any[]) => {
      const seen = new Set();
      return arr.filter((m) => {
        const id = m._id?.toString();
        if (!id) return false;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    };

    const unreadOut = dedupe(unreadMessages).reverse();
    const regularOut = dedupe(regularMessages).reverse();

    res.json({
      unreadMessages: unreadOut,
      regularMessages: regularOut,
      hasMore,
    });
  } catch (error) {
    next(error);
  }
};

//get unread message only
export const getUnreadMessages = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const chatId = req.params.chatId;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.user._id;

  if (!chatId) {
    throw new Error("Chat ID is required");
  }

  try {
    const user = await User.findById(userId);

    const unreadMessageIds = user.unreadMessages;

    const unreadMessages = await Message.find({
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

    const fetchedUnreadMessageIds = unreadMessages.map((msg) =>
      msg._id.toString()
    );

    user.unreadMessages = unreadMessageIds.filter(
      (id: string) => !fetchedUnreadMessageIds.includes(id.toString())
    );
    await user.save();

    res.json(unreadMessages.reverse());
  } catch (error) {
    next(error);
  }
};
