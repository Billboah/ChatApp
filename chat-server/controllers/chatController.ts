import { Response, NextFunction } from "express";
import { Chat, IChat } from "../models/chatModel";
import { User } from "../models/userModels";
import { CustomRequest, user } from "../config/express";
import { IMessage } from "../models/messageModel";

//get all chat
export const getAllChatController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const results = await Chat.find({ users: req.user._id })
      .populate("users", "username pic email")
      .populate("groupAdmin", "username pic email")
      .populate({
        path: "latestMessage",
        select: "chat content delivered sender",
        populate: {
          path: "sender",
          select: "username pic email",
        },
      })
      .sort({ updatedAt: -1 });

    const unread_messages = await User.findById(req.user._id)
      .select("unreadMessages")
      .populate({ path: "unreadMessages", select: "chat" });

    const populatedChat = results.map((chat) => {
      // Find unread messages for this chat
      const chat_unread_messages = unread_messages.unreadMessages.filter(
        (message: IMessage) =>
          message.chat._id.toString() === chat._id.toString()
      );

      // Add unread messages to the chat
      return {
        ...chat.toObject(),
        unreadMessages: chat_unread_messages,
      };
    });

    res.status(200).json(populatedChat);
  } catch (error) {
    next(error);
  }
};

//change group name
export const changeGroupNameController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, chatName }: { chatId: string; chatName: string } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "username pic email")
      .populate("groupAdmin", "username pic email");

    if (!updatedChat) {
      throw new Error("Chat Not Found");
    }

    res.json(updatedChat);
  } catch (error) {
    next(error);
  }
};

//change group icon
export const changeGroupIconController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, pic }: { chatId: string; pic: string } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        pic,
      },
      {
        new: true,
      }
    )
      .populate("users", "username pic email")
      .populate("groupAdmin", "username pic email");

    if (!updatedChat) {
      throw new Error("Chat Not Found");
    }

    res.json(updatedChat);
  } catch (error) {
    next(error);
  }
};

//remove a group member
export const removeMemberController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, userId }: { chatId: string; userId: string } = req.body;
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const chat: any = await Chat.findOne({ _id: chatId });

    if (chat.groupAdmin.toString() === req.user._id.toString()) {
      const removedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $pull: { users: userId },
        },
        { new: true }
      )
        .populate("users", "username pic email")
        .populate("groupAdmin", "username pic email");

      if (!removedChat) {
        throw new Error("Chat Not Found");
      }

      res.json(removedChat);
    } else {
      res.status(400);
      throw new Error("You are not authorized to perform this function");
    }
  } catch (error) {
    next(error);
  }
};

//add a group member/members
export const addMemberController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users: user[] = JSON.parse(req.body.userIds);
    const chatId: string = req.body.chatId;
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const chat: any = await Chat.findOne({ _id: chatId });

    if (chat.groupAdmin.toString() === req.user._id.toString()) {
      const addedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: { users: users },
        },
        { new: true }
      )
        .populate("users", "username pic email")
        .populate("groupAdmin", "username pic email");

      if (!addedChat) {
        return res.status(404).send("Chat Not Found");
      }

      res.json(addedChat);
    } else {
      throw new Error("You are not authorized to perform this function");
    }
  } catch (error) {
    next(error);
  }
};
