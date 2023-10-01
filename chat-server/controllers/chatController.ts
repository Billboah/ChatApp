import { Response } from 'express';
import { Chat, IChat } from '../models/chatModel'
import { User } from '../models/userModels';
import { CustomRequest, user } from '../config/express';


export const createChatController = async (req: CustomRequest, res: Response) => {
  try {
    const { userId }: { userId: string } = req.body;

    if (!userId) {
      console.log('UserId param not sent with request');
      return res.sendStatus(400);
    }

    const currentUser: user = req.user;
    const targetUser: user | null = await User.findById(userId);

    if (!targetUser) {
      console.log('Target user not found');
      return res.sendStatus(404);
    }

    const isChat: IChat[] = await Chat.find({
      isGroupChat: false,
      users: { $all: [currentUser._id, targetUser._id] },
    })
      .populate('users', '-password')
      .populate('latestMessage')
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
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [currentUser._id, targetUser._id],
      };

      const createdChat: IChat = await Chat.create(chatData);

      const fullChat: IChat | null = await Chat.findById(createdChat._id)
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
      } else {
        return res.status(500).send('Failed to create and fetch the chat');
      }
    }
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export const getAllChatController = async (req: CustomRequest, res: Response) => {
  try {
    const results: IChat[] = await Chat.find({ users: req.user._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, [
      {
        path: 'users',
        select: '-password',
        populate: {
          path: 'unreadMessages',
          populate: {
            path: 'chat',
            select: 'chatName isGroupChat',
          },
        },
      },
      {
        path: 'latestMessage.sender',
        select: 'username pic email',
      },
    ]);

    res.status(200).json(populatedResults);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export const createGroupChatController = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.body.users || !req.body.name) {
      res.status(400);
      throw new Error('Please fill all necessary fields');
    }

    const users: user[] = JSON.parse(req.body.users);

    if (users.length < 2) {
      res.status(400);
      throw new Error('More than 2 users are required to form a group chat');
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
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export const changeGroupNameController = async (req: CustomRequest, res: Response) => {
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
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      return res.status(400).send('Chat Not Found');
    }

    res.json(updatedChat);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export const changeGroupIconController = async (req: CustomRequest, res: Response) => {
  try {
    const { chatId, pic }: { chatId: string, pic: string } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        pic,
      },
      {
        new: true,
      }
    )
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    if (!updatedChat) {
      return res.status(400).send('Chat Not Found');
    }

    res.json(updatedChat);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export const removeMemberController = async (req: CustomRequest, res: Response) => {
  try {
    const { chatId, userId }: { chatId: string; userId: string } = req.body;

    const chat: any = await Chat.findOne({ _id: chatId })

    if (chat.groupAdmin.toString() === req.user._id.toString()) {
      const removedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $pull: { users: userId },
        },
        { new: true }
      )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

      if (!removedChat) {
        return res.status(400).send('Chat Not Found');
      }

      res.json(removedChat);
    } else {
      res.status(400);
      throw new Error('You are not authorized to perform this function');
    }

  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

export const addMemberController = async (req: CustomRequest, res: Response) => {
  try {
    const users: user[] = JSON.parse(req.body.userIds);
    const chatId: string = req.body.chatId;

    const chat: any = await Chat.findOne({ _id: chatId })

    if (chat.groupAdmin.toString() === req.user._id.toString()) {
      const addedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: { users: users },
        },
        { new: true }
      )
        .populate('users', '-password')
        .populate('groupAdmin', '-password');

      if (!addedChat) {
        return res.status(404).send('Chat Not Found');
      }

      res.json(addedChat);
    } else {
      throw new Error('You are not authorized to perform this function');
     }
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }

}