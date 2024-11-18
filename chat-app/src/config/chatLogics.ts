import { User } from '../types';
import { io } from 'socket.io-client';

export const BACKEND_API = 'http://localhost:5000';

export const socket = io(BACKEND_API);

export const getSender = (loggedUser: User, users: User[]) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export function getUserInChat(userId: string, users: User[]) {
  for (const user of users) {
    if (user._id === userId) {
      return user;
    }
  }
  return undefined;
}
