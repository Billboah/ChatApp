import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message, User } from '../../types';

interface ChatState {
  chats: Chat[];
  selectedChat: Chat | null;
  newMessage: Message | null;
  chatUser: User | null;
  messageChats: {
    regularMessages: Message[];
    unreadMessages: Message[];
    _id: string;
    hasMoreMessages: boolean;
    lastMessageId: any;
  }[];
  messagesLoading: boolean;
  messageError: { [key: string]: boolean };
  generalError: string;
  autoScroll: boolean;
  socketConnection: boolean;
  typingStatus: {
    isTyping: boolean;
    user: User | null;
    chatId: string | null;
  };
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
  newMessage: null,
  chatUser: parsedUser,
  messageChats: [],
  messagesLoading: false,
  messageError: {},
  generalError: '',
  autoScroll: false,
  socketConnection: false,
  typingStatus: {
    isTyping: false,
    user: null,
    chatId: null,
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.chatUser = action.payload;
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnection = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;

      if (action.payload) {
        localStorage.setItem('chats', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('chats');
      }
    },
    updateChat: (state, action) => {
      const updatedChats = state.chats.slice();
      const currentChat = action.payload;

      if (currentChat) {
        updatedChats.unshift(currentChat);
      }
      state.chats = updatedChats;
    },
    setTypingStatus: (state, action) => {
      state.typingStatus = action.payload;
    },
    setNewMessage: (
      state,
      action: PayloadAction<{ tempId: string; message: Message }>,
    ) => {
      const new_message = action.payload.message;

      state.newMessage = new_message;

      const updatedChats = state.chats.slice();
      const chat_message = state.messageChats.slice();

      //search for the chat
      const chatToMove = updatedChats.find(
        (cht: Chat) => cht._id === new_message.chat._id,
      );

      //search for chat with the same tempId
      const messageToInsert = chat_message.find(
        (cht: any) => cht._id === new_message.chat._id,
      );

      if (chatToMove) {
        chatToMove.latestMessage = new_message;

        const indexOfChatToMove = updatedChats.indexOf(chatToMove);
        if (indexOfChatToMove !== -1) {
          updatedChats.splice(indexOfChatToMove, 1);
          updatedChats.unshift(chatToMove);
        }
      }

      if (new_message.chat._id === state.selectedChat?._id) {
        state.autoScroll = true;
        if (messageToInsert) {
          messageToInsert.regularMessages.push(
            ...messageToInsert.unreadMessages,
          );
          messageToInsert.unreadMessages = [];

          const existingMessage = messageToInsert.regularMessages.slice();
          const messageIndex = existingMessage.findIndex(
            (msg: Message) => msg._id === action.payload.tempId,
          );

          if (messageIndex !== -1) {
            messageToInsert.regularMessages[messageIndex] = new_message;
          } else {
            messageToInsert.regularMessages.push(new_message);
          }
        }
      } else {
        if (!chatToMove?.unreadMessages.includes(new_message._id)) {
          chatToMove?.unreadMessages.push(new_message._id);
        }
      }
      //update message
      state.messageChats = chat_message;
      state.chats = updatedChats;
    },
    unsetUnreadMessages: (state, action: PayloadAction<string>) => {
      const chat_message = state.messageChats.slice();

      //search for chat with the same tempId
      const messageToInsert = chat_message.find(
        (cht: any) => cht._id === action.payload,
      );

      //update message
      if (messageToInsert) {
        messageToInsert.regularMessages.push(...messageToInsert.unreadMessages);
        messageToInsert.unreadMessages = [];
      }
      state.messageChats = chat_message;
    },
    setSelectedChat: (state, action: PayloadAction<Chat | null>) => {
      const user = state.chatUser;
      const chat = action.payload;

      state.selectedChat = action.payload;

      if (chat && user) {
        // Find the chat to update
        const chatToUpdate = state.chats.find(
          (cht: Chat) => cht._id === chat._id,
        );

        if (chatToUpdate) {
          chatToUpdate.unreadMessages = [];
        }
      }
    },
    setHasMore: (
      state,
      action: PayloadAction<{ hasMore: boolean; chatId: string }>,
    ) => {
      const chat_message = state.messageChats.slice();

      const messageToInsert = chat_message.find(
        (cht: any) => cht._id === action.payload.chatId,
      );
      if (messageToInsert) {
        messageToInsert.hasMoreMessages = action.payload.hasMore;
      }
    },
    updateMessageChats: (
      state,
      action: PayloadAction<{
        chatId: string;
        regularMessages: Message[];
        unreadMessages: Message[];
      } | null>,
    ) => {
      if (!action.payload) {
        return;
      }
      const user = state.chatUser;

      const { regularMessages, unreadMessages, chatId } = action.payload;

      const lastMessageId =
        regularMessages.length > 0
          ? regularMessages[0]._id
          : state.messageChats.find((cht: any) => cht._id === chatId)
              ?.lastMessageId;

      if (chatId && user) {
        const existingChat = state.messageChats.find(
          (cht: any) => cht._id === chatId,
        );

        if (existingChat) {
          existingChat.regularMessages = [
            ...regularMessages,
            ...existingChat.regularMessages,
          ];
          existingChat.unreadMessages.push(...unreadMessages);
          existingChat.lastMessageId = lastMessageId;
        } else {
          state.messageChats.push({
            _id: chatId,
            regularMessages: regularMessages,
            unreadMessages: unreadMessages,
            lastMessageId: lastMessageId,
            hasMoreMessages: true,
          });
          state.autoScroll = true;
        }
      }
    },
    setAutoScroll: (state, action: PayloadAction<boolean>) => {
      state.autoScroll = action.payload;
    },
    setMessageError: (
      state,
      action: PayloadAction<{ id: string; hasError: boolean }>,
    ) => {
      state.messageError[action.payload.id] = action.payload.hasError;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.generalError = action.payload;
    },
    setMessagesLoading: (state, action: PayloadAction<boolean>) => {
      state.messagesLoading = action.payload;
    },
    signOut: (state) => {
      state.messageChats = [];
      state.chats = [];
      localStorage.removeItem('chats');
    },
  },
});

export const {
  setCurrentUser,
  setChats,
  updateMessageChats,
  setSelectedChat,
  setNewMessage,
  updateChat,
  setMessagesLoading,
  setMessageError,
  unsetUnreadMessages,
  signOut,
  setError,
  setHasMore,
  setAutoScroll,
  setSocketConnected,
  setTypingStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
