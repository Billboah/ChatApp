import { Request, Response } from 'express';
import { Chat } from '../models/chatModel'
import { Message } from '../models/messageModel';
import { User } from '../models/userModels';
import { IUser } from '../models/userModels';

export const sendMessageController = async (req: Request, res: Response) => {
  const { content, chatId }: { content: string, chatId: string } = req.body

  if (!content || !chatId) {
    console.log('Invalid data passed into request')
    return res.sendStatus(400)
  }

  try {
    const newMessage = await Message.create({
      sender: req.user._id,
      content: content,
      chat: chatId,
      delivered: true,
    });

    const message = await Message.findById(newMessage._id)
      .populate('sender', 'username pic email')
      .populate('chat')
      .populate({
        path: 'chat.users',
        select: 'username pic email',
      });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    })

    const usersInChat = await User.find({ selectedChat: chatId });

    await Chat.updateMany(
      {
        _id: { $ne: req.body.chatId },
        'users': { $nin: usersInChat.map((user: IUser) => user._id) },
      },
      {
        $push: { unreadMessages: message },
      },
      { new: true }
    );

    res.json(message)
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export const getChatMessages = async (req: Request, res: Response) => {
  const chatId = req.params.chatId
  const userId = req.user._id
  try {
    const message = await Message.find({ chat: chatId })
      .populate("sender", "username pic email")
      .populate("chat")

    await User.findByIdAndUpdate(
      userId,
      {
        selectedChat: chatId,
      },
      { new: true }
    );

    const chat = await Chat.findById(chatId);

    const userInChat = chat.users.find(user => user.toString() === userId);;

    if (userInChat) {

      await User.findByIdAndUpdate(
        userId,
        {
          unreadMessages: [],
        },
        { new: true }
      )
    }

    res.json(message)
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}