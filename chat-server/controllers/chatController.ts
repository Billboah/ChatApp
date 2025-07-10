import { Response, NextFunction } from "express";
import { Chat, IChat } from "../models/chatModel";
import { User } from "../models/userModels";
import { CustomRequest, user } from "../config/express";

//create individual chat
export const createChatController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId }: { userId: string } = req.body;

    if (!userId) {
      throw new Error("Select a user to start a new chat chat");
    }

    const currentUser: user = req.user;
    const targetUser: user | null = await User.findById(userId);

    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const isChat: IChat[] = await Chat.find({
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
    } else {
      //if chat is not available, create a new one
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [currentUser._id, targetUser._id],
      };

      const createdChat = await Chat.create(chatData);

      const fullChat = await Chat.findOne({ _id: createdChat._id })
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
          .send({ ...fullChat.toObject(), unreadMessages: [] });
      } else {
        throw new Error("Failed to create and fetch the chat");
      }
    }
  } catch (error) {
    next(error);
  }
};

//get all chat
export const getAllChatController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = await Chat.find({ users: req.user._id })
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

    const unread_messages = await User.findById(req.user._id)
      .select("unreadMessages")
      .populate({ path: "unreadMessages", select: "chat" });

    const populatedChat = results.map((chat) => {
      // Find unread messages for this chat
      const chat_unread_messages = unread_messages.unreadMessages.filter(
        (message) => message.chat._id.toString() === chat._id.toString()
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

//create a group chat
export const createGroupChatController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.users || !req.body.name) {
      res.status(400);
      throw new Error("Please fill all necessary fields");
    }

    const users: user[] = JSON.parse(req.body.users);

    if (users.length < 2) {
      res.status(400);
      throw new Error("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      pic: req.body.pic,
      users: users,
      groupAdmin: req.user._id,
      isGroupChat: true,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
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
        .send({ ...fullGroupChat.toObject(), unreadMessages: [] });
    } else {
      throw new Error("Failed to create and fetch the the group chat");
    }
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
