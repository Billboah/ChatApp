import { Request } from "express";

// Extend the Request type
export interface CustomRequest extends Request {
  user: {
    _id: string;
    username: string;
    pic: string;
    name: string;
    email: string;
    unreadMessages: any[];
    selectedChat: any;
  };
}

export interface user {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
  unreadMessages: any[];
  selectedChat: any;
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
