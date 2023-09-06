// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  chats: ChatInfo[];
  selectedChat: ChatInfo | null;
  chatChange: boolean;
}

interface UserInfo {
  _id: string;
  name: string;
  username: string;
  email: string;
  pic: string;
}

interface ChatInfo {
  groupAdmin: UserInfo;
  _id: string;
  pic: string;
  chatName: string;
  latestMessage: any;
  unreadMessages: any[];
  isGroupChat: boolean;
  createdAt: string;
  users: UserInfo[];
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
};

const authSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<ChatInfo[]>) => {
      state.chats = action.payload;

      if (action.payload) {
        localStorage.setItem('chats', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('chats');
      }
    },
    setSelectedChat: (state, action: PayloadAction<ChatInfo | null>) => {
      state.selectedChat = action.payload;
    },
    setChatChange: (state, action: PayloadAction<boolean>) => {
      state.chatChange = action.payload;
    },
  },
});

export const { setChats, setSelectedChat, setChatChange } = authSlice.actions;

export default authSlice.reducer;
