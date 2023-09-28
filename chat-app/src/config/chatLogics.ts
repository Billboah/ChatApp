import { Chat, Message, User } from '../types';

export const BACKEND_API = 'https://chatserver.vercel.app';

export const getSender = (loggedUser: User, users: User[]) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const getUnreadMessages = (chat: Chat, user: User | null) => {
  const userInChat = chat.users.find(
    (chatUser) => chatUser._id.toString() === user?._id.toString(),
  );

  let unreadMessagesForChat: Message[] = [];

  if (userInChat) {
    if (userInChat.unreadMessages && Array.isArray(userInChat.unreadMessages)) {
      unreadMessagesForChat = userInChat.unreadMessages.filter(
        (message) => message.chat._id.toString() === chat._id.toString(),
      );

      return unreadMessagesForChat;
    } else {
      return (unreadMessagesForChat = []);
    }
  } else {
    console.log('User not found in the chat.');
  }

  return unreadMessagesForChat;
};

export function getUserInChat(userId: string, users: User[]) {
  for (const user of users) {
    if (user._id === userId) {
      return user;
    }
  }
  return undefined;
}
