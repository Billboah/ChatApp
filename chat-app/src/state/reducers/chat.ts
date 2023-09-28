// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message, User } from '../../types';

interface ChatState {
  chats: Chat[] | null;
  selectedChat: Chat | null;
  chatChange: boolean;
  newMessage: Message | null;
  chatUser: User | null;
}

const storedChat = localStorage.getItem('chats');
let parsedChats = null;
const storedUser = localStorage.getItem('user');
let parsedUser = null;

try {
  parsedChats = storedChat ? JSON.parse(storedChat) : null;
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
  console.error('Error parsing stored user:', error);
}

const initialState: ChatState = {
  chats: parsedChats,
  selectedChat: null,
  chatChange: false,
  newMessage: null,
  chatUser: parsedUser,
};

const authSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.chatUser = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;

      if (action.payload) {
        localStorage.setItem('chats', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('chats');
      }
    },
    setNewMessage: (state, action: PayloadAction<Message>) => {
      state.newMessage = action.payload;
    },
    updateChats: (state, action) => {
      const user = state?.chatUser;
      if (state.chats !== null && user !== null) {
        const updatedChats = state.chats.slice();
        const selectedChat = state.selectedChat;
        const chatToMove: Chat | undefined = updatedChats.find(
          (chat) => chat._id === action.payload.chat._id,
        );

        if (chatToMove) {
          const chatUserToUpdate = chatToMove.users.find(
            (chatUser) => chatUser._id === user._id,
          );
          if (selectedChat?._id !== chatToMove._id) {
            const messageExists = chatUserToUpdate?.unreadMessages.some(
              (message) => message._id === action.payload._id,
            );

            if (!messageExists) {
              chatUserToUpdate?.unreadMessages.push(action.payload);
            }
          } else {
            chatUserToUpdate?.unreadMessages.filter(
              (message) => message.chat._id !== chatToMove._id,
            );
          }
          action.payload
            ? (chatToMove.latestMessage = action.payload)
            : (chatToMove.latestMessage = state.newMessage);
          const indexOfChatToMove = updatedChats.indexOf(chatToMove);
          if (indexOfChatToMove !== -1) {
            updatedChats.splice(indexOfChatToMove, 1);
            updatedChats.unshift(chatToMove);
          }
        }
        state.chats = updatedChats;
      }
    },
    setSelectedChat: (state, action: PayloadAction<Chat | null>) => {
      const user = state?.chatUser;
      state.selectedChat = action.payload;
      if (state.chats !== null && user !== null && action.payload !== null) {
        const updatedChats = state.chats.slice();
        const selectedChat = action.payload;

        const chatToUpdate: Chat | undefined = updatedChats.find(
          (chat) => chat._id === selectedChat._id,
        );

        if (chatToUpdate) {
          const chatUserToUpdate = chatToUpdate.users.find(
            (chatUser) => chatUser._id === user._id,
          );

          if (chatUserToUpdate) {
            chatUserToUpdate.unreadMessages =
              chatUserToUpdate.unreadMessages.filter(
                (message) => message.chat._id !== chatToUpdate._id,
              );
          }
        }

        state.chats = updatedChats;
      }
    },
    setChatChange: (state, action: PayloadAction<boolean>) => {
      state.chatChange = action.payload;
    },
  },
});

export const {
  setCurrentUser,
  setChats,
  setSelectedChat,
  setChatChange,
  updateChats,
  setNewMessage,
} = authSlice.actions;

export default authSlice.reducer;
