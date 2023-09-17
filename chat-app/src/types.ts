export interface User {
  _id: string;
  username: string;
  pic: string;
  name: string;
  email: string;
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

export interface Chat {
  groupAdmin: User;
  _id: string;
  pic: string;
  chatName: string;
  isGroupChat: boolean;
  latestMessage: Message | null;
  unreadMessages: Message[];
  createdAt: string;
  users: User[];
}
