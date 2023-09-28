import {  Response } from 'express';
import { Chat } from '../models/chatModel'
import { Message } from '../models/messageModel';
import { User } from '../models/userModels';
import { IUser } from '../models/userModels';
import {CustomRequest} from '../config/express'

export const sendMessageController = async (req: CustomRequest, res: Response) => {
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

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    })

    const chat = await Chat.findOne({ _id: chatId });

const usersInChat = chat.users;

User && await User.updateMany(
  { 
    _id: { $in: usersInChat },
    selectedChat: { $ne: chatId },
  },
  {
    $push: { 'unreadMessages': message }, 
  },
  {
    new: true,
  }
);

    res.json(message)
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export const getChatMessages = async (req: CustomRequest, res: Response) => {
  const chatId = req.params.chatId
  const userId = req.user?._id

  if (!chatId){
    return
  }
  
  try {
    const messageIdsToRemove = await Message.find({ chat: chatId }).distinct('_id');

    if (userId){
    const message = await Message.find({ chat: chatId })
      .populate("sender", "username pic email")
      .populate("chat")

      await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            unreadMessages: {
              $in: messageIdsToRemove
            }
          },
        },
        { new: true }
      );      

    res.json(message)
    
  }else{
    res.status(400).json({error: 'User does not exist'})
  }
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}
