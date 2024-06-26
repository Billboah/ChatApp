import { Response } from "express";
import { User } from "../models/userModels";
import generateToken from "../config/generateToken";
import { CustomRequest } from "../config/express";

export const signupController = async (req: CustomRequest, res: Response) => {
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
      res.status(400);
      throw new Error("Failed to create the User");
    }
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const signInController = async (req: CustomRequest, res: Response) => {
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
      res.status(400);
      throw new Error("Invalid user name or email or password ");
    }
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const searchUsersController = async (
  req: CustomRequest,
  res: Response
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
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const changeUserName = async (req: CustomRequest, res: Response) => {
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
    console.error(error);
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const changePicController = async (
  req: CustomRequest,
  res: Response
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
    res.status(error.status || 500).json({ error: error.message });
  }
};

export const updateSelectedChat = async (req: CustomRequest, res: Response) => {
  const { selectedChatId } = req.body;
  const userId = req.user._id;

  try {
    if (userId) {
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
    }

    res.json();
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};
