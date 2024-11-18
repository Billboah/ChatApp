import { Response } from "express";
import { Chat } from "../models/chatModel";
import { Message } from "../models/messageModel";
import { User } from "../models/userModels";
import { CustomRequest } from "../config/express";
import { AnyAaaaRecord } from "dns";

//send message
export const sendMessage = async (req: CustomRequest, res: Response) => {
  const { content, chatId }: { content: string; chatId: string } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    delivered: true,
  };

  try {
    const message = await Message.create(newMessage);

    await message.populate("sender", "username pic email");
    await message.populate("chat");
    await User.populate(message.chat, {
      path: "users",
      select: "username pic email selectedChat unreadMessages",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    const chat = await Chat.findOne({ _id: chatId });

    const usersInChat = chat.users;

    await User.updateMany(
      {
        _id: { $in: usersInChat },
        selectedChat: { $ne: chatId },
      },
      {
        $push: { unreadMessages: message },
      },
      {
        new: true,
      }
    );

    res.json(message);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

//get all messages
export const getChatMessages = async (req: CustomRequest, res: Response) => {
  const chatId = req.params.chatId;
  const userId = req?.user._id;
  const { lastMessageId } = req.query;
  const limit = 20;
  if (!chatId) {
    return res.status(400).json({ error: "Chat ID is required" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User does not exist" });
  }

  try {
    const user = await User.findById(userId);

    const unreadMessageIds = user.unreadMessages;

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

    const regularMessages = await Message.find(filter)
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

    const fetchedUnreadMessageIds = unreadMessages.map((msg) =>
      msg._id.toString()
    );

    user.unreadMessages = unreadMessageIds.filter(
      (id) => !fetchedUnreadMessageIds.includes(id.toString())
    );
    await user.save();

    if (unreadMessages && unreadMessages.length > 0) {
      res.json({
        unreadMessages: [...unreadMessages].reverse(),
        regularMessages: [...regularMessages].reverse(),
      });
    } else {
      res.json({
        unreadMessages: [],
        regularMessages: [...regularMessages].reverse(),
      });
    }
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const getUnreadMessages = async (req: CustomRequest, res: Response) => {
  const chatId = req.params.chatId;
  const userId = req?.user._id;

  if (!chatId) {
    return res.status(400).json({ error: "Chat ID is required" });
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
      (id) => !fetchedUnreadMessageIds.includes(id.toString())
    );
    await user.save();

    res.json(unreadMessages.reverse());
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};
