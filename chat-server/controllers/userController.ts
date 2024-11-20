import { NextFunction, Response } from "express";
import { User } from "../models/userModels";
import generateToken from "../config/generateToken";
import { CustomRequest } from "../config/express";
import { Message } from "../models/messageModel";

export const signupController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, username, email, password, pic, confirmPassword } = req.body;

  try {
    if (!name || !email || !password || !username || !confirmPassword) {
      res.status(400);
      throw new Error("Please fill all the marked feilds");
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      username,
      password,
      pic,
      confirmPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        pic: user.pic,
        selectedChat: user.selectedChat,
        unreadMessages: user.unreadMessages,
        token: generateToken(user._id),
      });
    } else {
      throw new Error("Failed to create the User");
    }
  } catch (error) {
    next(error);
  }
};

export const signInController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, password } = req.body;
  try {
    if (!password || !name) {
      res.status(400);
      throw new Error("Please enter all the feilds");
    }

    const user = await User.findOne({
      $or: [{ username: name }, { email: name }],
    });

    if (user && (await user.comparePassword(password))) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        pic: user.pic,
        selectedChat: user.selectedChat,
        unreadMessages: user.unreadMessages,
        token: generateToken(user._id),
      });
    } else {
      throw new Error("Invalid user name/email or password ");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const searchUsersController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const keyword = req.query.search;

  try {
    const users = await User.find(
      keyword
        ? {
            $or: [
              { username: { $regex: keyword, $options: "i" } },
              { email: { $regex: keyword, $options: "i" } },
            ],
          }
        : {}
    ).find({ _id: { $ne: req.user._id } });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const changeUserName = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const username: string = req.body.username;
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      res.status(400);
      throw new Error("User Not Found");
    }

    res.status(201).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      pic: updatedUser.pic,
      selectedChat: updatedUser.selectedChat,
      unreadMessages: updatedUser.unreadMessages,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    next(error);
  }
};

export const changePicController = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const pic: string = req.body.pic;
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        pic,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      res.status(400);
      throw new Error("User Not Found");
    }

    res.status(201).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      pic: updatedUser.pic,
      selectedChat: updatedUser.selectedChat,
      unreadMessages: updatedUser.unreadMessages,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    next(error);
  }
};

export const updateSelectedChat = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { selectedChatId } = req.body;
  const userId = req.user._id;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User authentication required" });
    }
    if (selectedChatId) {
      await User.findByIdAndUpdate(
        userId,
        {
          selectedChat: selectedChatId,
        },
        { new: true }
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        {
          selectedChat: null,
        },
        { new: true }
      );
    }

    res.json();
  } catch (error) {
    next(error);
  }
};
