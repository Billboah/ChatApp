import { Request } from 'express';

// Extend the Request type
export interface CustomRequest extends Request {
              user: {
                            _id: string;
                            username: string;
                            pic: string;
                            name: string;
                            email: string;
                            token: string;
              }
}

export interface user {
              _id: string;
              username: string;
              pic: string;
              name: string;
              email: string;
              token: string;
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
              unreadMessages: message[];
              createdAt: string;
              users: user[];
}
            

