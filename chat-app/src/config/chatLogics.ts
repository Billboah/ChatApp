import { User } from '../types';

export const BACKEND_API = 'http://localhost:5000';

export const getSender = (loggedUser: User, users: User[]) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};
