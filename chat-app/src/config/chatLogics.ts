import { User } from '../types';

export const BACKEND_API =
  process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000';

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
