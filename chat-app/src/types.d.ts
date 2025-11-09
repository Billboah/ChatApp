export interface User {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
  selectedChat: string | null;
  unreadMessages: Message[];
  token: string;
}

export interface UserInfo {
  _id: string;
  name: string;
  username: string;
  email: string;
  pic: string;
  token: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  delivered: boolean;
  updatedAt: string;
}

export interface ModifyMessage extends Message {
  isContinuous?: boolean;
}

export interface Chat {
  groupAdmin: User;
  _id: string;
  pic: string;
  chatName: string;
  unreadMessages: string[];
  isGroupChat: boolean;
  latestMessage: Message | null;
  createdAt: string;
  users: User[];
}
