// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '../../types';

interface ChatState {
  chats: Chat[] | null;
  selectedChat: Chat | null;
  chatChange: boolean;
  newMessage: Message | null;
}

const storedChat = localStorage.getItem('chats');
let parsedChats = null;

try {
  parsedChats = storedChat ? JSON.parse(storedChat) : null;
} catch (error) {
  console.error('Error parsing stored user:', error);
}

const initialState: ChatState = {
  chats: parsedChats,
  selectedChat: null,
  chatChange: false,
  newMessage: null,
};

const authSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
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
      if (state.chats !== null) {
        const updatedChats = state.chats.slice();
        const selectedChat = state.selectedChat;
        const chatToMove: Chat | undefined = updatedChats.find((chat) =>
          !action.payload && selectedChat
            ? chat._id === selectedChat?._id
            : chat._id === action.payload.chat._id,
        );
        if (chatToMove) {
          if (selectedChat?._id !== chatToMove._id) {
            const messageExists = chatToMove.unreadMessages.some(
              (message) => message._id === action.payload._id,
            );

            if (!messageExists) {
              chatToMove.unreadMessages.push(action.payload);
            }
          } else {
            chatToMove.unreadMessages = [];
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
      state.selectedChat = action.payload;
      if (state.chats !== null) {
        const updatedChats = state.chats.slice();
        const selectedChat = state.selectedChat;
        const chatToMove: Chat | undefined = updatedChats.find(
          (chat) => chat._id === selectedChat?._id,
        );
        if (chatToMove) {
          chatToMove.unreadMessages = [];
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
  setChats,
  setSelectedChat,
  setChatChange,
  updateChats,
  setNewMessage,
} = authSlice.actions;

export default authSlice.reducer;
