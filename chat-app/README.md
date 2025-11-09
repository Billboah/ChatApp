# ChatApp Frontend Technical Architecture

Core implementation of a real-time chat system with sophisticated state management, optimistic updates, and intelligent cache invalidation. Built with TypeScript, Redux, Socket.IO, and React.

## Technical Stack Details

- **State Management**: Redux + Immer
- **Real-time**: Socket.IO client with reconnection handling
- **UI**: React 18 + TailwindCSS
- **Build**: TypeScript + Webpack 5
- **Testing**: Jest + React Testing Library

## Core Implementation Features

1. **Message Synchronization**

   - Optimistic updates with temporary IDs
   - Smart deduplication in reducer
   - Selective history fetching
   - Unread message tracking

2. **Cache Management**
   - Normalized message store
   - Separate read/unread buckets
   - Intelligent invalidation
   - Pagination support

## State Management Architecture

### Redux Store Structure

```typescript
interface RootState {
  chat: {
    chats: Chat[];
    selectedChat: Chat | null;
    messageChats: {
      _id: string;
      regularMessages: Message[];
      unreadMessages: Message[];
      hasMoreMessages: boolean;
      lastMessageId: string | null;
    }[];
    messagesLoading: boolean;
    socketConnection: boolean;
    typingStatus: {
      isTyping: boolean;
      user: User | null;
      chatId: string | null;
    };
  };
  auth: {
    user: User | null;
    token: string | null;
  };
}
```

### Message Handling Flow

1. **Send Message**

```typescript
// 1. Optimistic update with temp ID
dispatch(
  setNewMessage({
    tempId: uuid(),
    message: { ...newMsg },
  }),
);

// 2. Emit via socket
socket.emit('send message', {
  content,
  chatId,
  tempId,
});

// 3. Server ack - replace temp with real
socket.on('message sent', (msg) => {
  dispatch(
    setNewMessage({
      tempId: msg.tempId,
      message: msg,
    }),
  );
});
```

2. **Receive Message**

```typescript
socket.on('received message', (msg) => {
  // Add to unread if chat not selected
  dispatch(setNewMessage({ message: msg }));

  // Update chat list order
  dispatch(updateChat(msg.chat));
});
```

The frontend may read environment variables at build time. Create `.env.local` or `.env` in `chat-app/` for local overrides. Common variables used in this project:

- `REACT_APP_API_URL` - Base URL for REST API (default: `http://localhost:5000/api`)
- `REACT_APP_SOCKET_URL` - Socket.IO server URL (default: `http://localhost:5000`)

Example `.env.local`:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Note: React environment variables must be prefixed with `REACT_APP_` to be embedded at build time.

## Performance Optimizations

### Message List Virtualization

```typescript
const MessageList = () => {
  return (
    <VirtualList
      itemCount={messages.length}
      itemSize={80}
      overscanCount={5}
      onItemsRendered={loadMoreIfNeeded}
    >
      {({ index, style }) => (
        <Message message={messages[index]} style={style} />
      )}
    </VirtualList>
  );
};
```

### Efficient Redux Updates

````typescript
// Using Immer for immutable updates
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setNewMessage: (state, action) => {
      const { tempId, message } = action.payload
      const msgChat = state.messageChats.find(
        mc => mc._id === message.chat
      )

      if (msgChat) {
        // Immer allows "mutating" logic
        const idx = msgChat.regularMessages
          .findIndex(m => m._id === tempId)
        if (idx >= 0) {
          msgChat.regularMessages[idx] = message
        } else {
          msgChat.regularMessages.push(message)
        }
      }
    }
  }
})

## Advanced Implementation Details

### Message Cache Management
```typescript
interface MessageChat {
  _id: string
  regularMessages: Message[]  // Read messages
  unreadMessages: Message[]   // New messages while chat not selected
  hasMoreMessages: boolean    // For pagination
  lastMessageId: string | null // Cursor for pagination
}

// Regular messages shown when chat selected
const messages = useMemo(() => {
  const chat = messageChats.find(c => c._id === selectedChat?._id)
  return chat ? [...chat.regularMessages] : []
}, [messageChats, selectedChat])

// Unread count for chat list
const unreadCount = useMemo(() => {
  const chat = messageChats.find(c => c._id === chatId)
  return chat?.unreadMessages.length ?? 0
}, [messageChats, chatId])
```

### Socket Connection Management
```typescript
const socket = io(SOCKET_URL, {
  auth: token => ({ token }),
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
})

socket.on('connect', () => {
  dispatch(setSocketConnected(true))
  // Rejoin active chat room after reconnect
  if (selectedChat?._id) {
    socket.emit('join chat', selectedChat._id)
  }
})

socket.on('disconnect', () => {
  dispatch(setSocketConnected(false))
})

## How the frontend talks to the backend

REST:

- The frontend calls the REST API (endpoints under `/api`) for actions like login, register, fetching chats and messages. Use `REACT_APP_API_URL` to point to the backend.

Auth:

- After login, the backend returns a JWT. The frontend should store this JWT securely (in memory or HTTP-only cookie if backend sets cookies). The app currently stores token in localStorage and attaches it in `Authorization: Bearer <token>` header for subsequent requests.

Socket connection:

- The frontend opens a Socket.IO connection and passes the JWT in the handshake `auth` payload: `{ token }`.
- Example (client-side):

```js
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token') || '',
  },
});

socket.on('connect', () => console.log('socket connected', socket.id));
````

## Socket events used by the frontend

- `connected` (server -> client): ack after successful auth
- `join chat` (client -> server): join a chat room (payload: chatId)
- `leave chat` (client -> server): leave currently selected chat
- `send message` (client -> server): send message payload { content, chatId }
- `received message` (server -> client): broadcast when others send a message
- `message sent` (server -> client): ack to the sender with stored message
- `typing` / `stop typing` (client -> server): typing indicator events

## Building and deployment notes

- Run `npm run build` to produce an optimized static bundle under `build/`.
- The `build/` folder can be served by any static hosting provider (Netlify, Vercel, S3 + CDN) or copied into the `chat-server/public` folder if you want the server to serve the client files.
- Ensure `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` are set to the production backend URLs at build time.

## Development tips & troubleshooting

- If sockets fail to connect:

  - Confirm the backend `PORT` and `FRONTEND_URL` CORS settings allow connections.
  - Inspect browser console for CORS or auth errors.
  - Confirm the client sends the token via `auth` when creating the socket.

- If API calls return 401/403:

  - Verify the JWT in localStorage (or cookie) matches server `JWT_SECRET`.
  - Check token expiry.

- For bundle-size warnings (import sizes shown in dev tools):
  - Server-only libs (like `socket.io` or `mongoose`) shown in the server code are irrelevant for client bundle size. On the client, prefer lightweight libraries and use `import type` where possible to avoid accidental runtime imports.

## Where to look in source

- App entry: `src/index.tsx` and `src/App.tsx`
- Socket client helper: `src/socket/socket.ts` or `src/socket/socket.tsx` (depending on structure)
- API helpers: `src/utils/api.ts`
- Chat UI and logic: `src/Chat/`

## ⚠️ Important frontend note — messageChats & fetching behavior

There is an intentional behavior in the client reducer to avoid creating message containers for chats that the client hasn't explicitly loaded yet. This helps avoid the UX issue where only unread messages received after login/connection are shown when a user first opens a chat.

Summary:

- `chat-app/src/state/reducers/chat.ts` — `setNewMessage` will no longer create a new `messageChat` if one does not already exist. Incoming messages for unknown chats will be ignored in `messageChats` until the chat is loaded.
- When a chat is selected, the UI should fetch the full history if `state.messageChats` does not contain an entry for that chat.
- If a `messageChat` exists in state, do not fetch the full history on every selection. Only fetch more messages when the user scrolls and `hasMoreMessages` is true (pagination).

Where to edit:

- Change reducer behavior: `chat-app/src/state/reducers/chat.ts` (`setNewMessage`, `updateMessageChats`).
- Change selection/fetch logic: e.g. `chat-app/src/Chat/chatSidebar/chatList.ts` and the chat message component `chat-app/src/Chat/chatMessage/index.tsx`.

Developer checklist for expected behavior:

1. On first click of a chat after login, if there's no `messageChat` entry, fetch the full history and populate `messageChats`.
2. While chat exists in `messageChats`, new incoming messages should go to `unreadMessages` if the chat isn't selected, otherwise to `regularMessages` when selected.
3. Only request earlier pages when `hasMoreMessages` is true and the user scrolls to top.

99<!-- Follow-up suggestions removed: smoke-test script, CI job, and env/token-storage improvements can be implemented on request. -->

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
