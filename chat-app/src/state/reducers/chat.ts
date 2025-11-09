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
    lastMessageId: string | null;
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
const storedChat =
  typeof localStorage !== 'undefined' ? localStorage.getItem('chats') : null;
const storedUser =
  typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;

let parsedChats = null;
let parsedUser = null;

try {
  parsedChats = storedChat ? JSON.parse(storedChat) : null;
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
  console.error('Error parsing stored user:', error);
}

const initialState: ChatState = {
  chats: parsedChats ?? [],
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
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.chatUser = action.payload;
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnection = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;

      if (typeof localStorage !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('chats', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('chats');
        }
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
      const { tempId, message } = action.payload;

      if (!message || !message.chat) {
        console.warn('Invalid message or missing chat in message payload');
        return;
      }
      // keep last received/created message for UI hooks
      state.newMessage = message;

      // Normalize chat id (message.chat can be an id string or populated object)
      const incomingChatId =
        typeof message.chat === 'string' ? message.chat : message.chat._id;

      // Update global chats list: set latestMessage and move chat to top
      const chatIdx = state.chats.findIndex(
        (c) => String(c._id) === String(incomingChatId),
      );
      if (chatIdx !== -1) {
        state.chats[chatIdx].latestMessage = message;
        const [chat] = state.chats.splice(chatIdx, 1);
        // clear unread ids if this chat is currently selected
        const selectedId = state.selectedChat?._id;
        if (selectedId && String(selectedId) === String(incomingChatId)) {
          chat.unreadMessages = [];
        } else {
          chat.unreadMessages = chat.unreadMessages || [];
          // store ids as strings and avoid duplicates
          const msgIdStr = String(message._id);
          if (!chat.unreadMessages.map(String).includes(msgIdStr)) {
            chat.unreadMessages.push(message._id);
          }
        }
        state.chats.unshift(chat);
      } else {
        // If chat isn't in list yet, add it with latestMessage
        const chatToInsert =
          typeof message.chat === 'string'
            ? ({ _id: message.chat, latestMessage: message } as unknown as Chat)
            : ({ ...message.chat, latestMessage: message } as Chat);
        state.chats.unshift(chatToInsert);
      }

      // Find the message chat for this chat
      const msgChatIndex = state.messageChats.findIndex(
        (mc) => String(mc._id) === String(incomingChatId),
      );

      // If message chat doesn't exist, do NOT create a new one
      if (msgChatIndex === -1) {
        // Do nothing, skip processing for non-existing messageChat
        return;
      }

      // Get the message chat (either existing or newly created)
      const msgChat = state.messageChats.find(
        (mc) => String(mc._id) === String(incomingChatId),
      )!;

      // Check if message chat exists and if the chat is not selected
      if (
        msgChatIndex !== -1 &&
        (!state.selectedChat?._id ||
          String(state.selectedChat._id) !== String(incomingChatId))
      ) {
        // Add to unread messages if not duplicate
        if (
          !msgChat.unreadMessages.find(
            (m) => String(m._id) === String(message._id),
          )
        ) {
          msgChat.unreadMessages.push(message);
          // Sort unread messages by updatedAt in ascending order
          msgChat.unreadMessages.sort(
            (a, b) =>
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
          );
        }
        return;
      }

      if (
        state.selectedChat?._id &&
        String(state.selectedChat._id) === String(incomingChatId)
      ) {
        state.autoScroll = true;

        // Combine regular and unread messages
        const allMessages = [
          ...msgChat.regularMessages,
          ...msgChat.unreadMessages,
        ];

        // Check if message exists (by _id or tempId)
        const existingMsgIndex = allMessages.findIndex(
          (m) => m._id === message._id || m._id === tempId,
        );

        if (existingMsgIndex !== -1) {
          // Replace existing message
          msgChat.regularMessages = allMessages
            .map((m) =>
              m._id === message._id || m._id === tempId ? message : m,
            )
            // Sort messages by updatedAt in ascending order (oldest first)
            .sort(
              (a, b) =>
                new Date(a.updatedAt).getTime() -
                new Date(b.updatedAt).getTime(),
            );
        } else {
          // Add new message and sort
          const updatedMessages = [...msgChat.regularMessages, message];
          msgChat.regularMessages = updatedMessages.sort(
            (a, b) =>
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
          );
        }

        // Clear unread messages when chat is selected
        msgChat.unreadMessages = [];
      } else {
        // Not viewing this chat: add to unreadMessages if not duplicate
        if (
          !msgChat.unreadMessages.find(
            (m) => String(m._id) === String(message._id),
          )
        ) {
          msgChat.unreadMessages.push(message);
          // Sort unread messages by updatedAt
          msgChat.unreadMessages.sort(
            (a, b) =>
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
          );
        }
      }

      msgChat.lastMessageId = message._id;
    },
    unsetUnreadMessages: (state, action: PayloadAction<string>) => {
      const chat_message = state.messageChats.slice();

      //search for chat with the same tempId
      const messageToInsert = chat_message.find(
        (cht) => cht._id === action.payload,
      );

      //update message and sort by updatedAt
      if (messageToInsert) {
        const allMessages = [
          ...messageToInsert.regularMessages,
          ...messageToInsert.unreadMessages,
        ];
        messageToInsert.regularMessages = allMessages.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
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
        (cht) => cht._id === action.payload.chatId,
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
        hasMore?: boolean;
      } | null>,
    ) => {
      if (!action.payload) return;
      const user = state.chatUser;

      const {
        regularMessages = [],
        unreadMessages = [],
        chatId,
        hasMore,
      } = action.payload;

      const lastMessageId =
        regularMessages.length > 0
          ? regularMessages[0]._id
          : state.messageChats.find((cht) => cht._id === chatId)
              ?.lastMessageId || null;

      const PAGE_SIZE = 20; // must match server limit

      if (chatId && user) {
        const existingChat = state.messageChats.find(
          (cht) => cht._id === chatId,
        );

        if (existingChat) {
          // dedupe incoming messages against existing regular messages
          const existingIds = new Set(
            existingChat.regularMessages.map((m) => m._id),
          );
          const incoming = regularMessages.filter(
            (m) => !existingIds.has(m._id),
          );
          existingChat.regularMessages = [
            ...incoming,
            ...existingChat.regularMessages,
          ];

          // dedupe unread messages
          const unreadExistingIds = new Set(
            existingChat.unreadMessages.map((m) => m._id),
          );
          const incomingUnread = unreadMessages.filter(
            (m) => !unreadExistingIds.has(m._id),
          );
          existingChat.unreadMessages.push(...incomingUnread);

          existingChat.lastMessageId = lastMessageId;
          // prefer explicit server hasMore, fallback to page-size heuristic
          existingChat.hasMoreMessages =
            typeof hasMore === 'boolean'
              ? hasMore
              : regularMessages.length >= PAGE_SIZE;
        } else {
          state.messageChats.push({
            _id: chatId,
            regularMessages: regularMessages,
            unreadMessages: unreadMessages,
            lastMessageId: lastMessageId,
            hasMoreMessages:
              typeof hasMore === 'boolean'
                ? hasMore
                : regularMessages.length >= PAGE_SIZE,
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
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('chats');
      }
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
