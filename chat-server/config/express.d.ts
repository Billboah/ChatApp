import { Request } from "express";
import { IUser } from "../models/userModels";

// Extend the Request type
export interface CustomRequest extends Request {
  user?: IUser & Document;
  limit?: number;
  page?: number;
}

export interface user {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
  unreadMessages: message[];
  selectedChat: string | null;
}

export interface message {
  _id: string;
  sender: user;
  content: string;
  chat: chat;
  delivered: boolean;
  updatedAt: string;
}

export interface chat {
  groupAdmin: user;
  _id: string;
  pic: string;
  chatName: string;
  isGroupChat: boolean;
  latestMessage: message | null;
  createdAt: string;
  users: user[];
}
