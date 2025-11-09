# ChatApp - Technical Documentation

Advanced real-time chat system implementing sophisticated message synchronization, optimistic updates, and intelligent cache management. Built with TypeScript throughout the stack.

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

[Live Demo](https://chatapp-amber-rho.vercel.app) | [API Documentation](#api-architecture) | [Socket Events](#socket-architecture)

## Demo Accounts

Test accounts available: user1 through user8

- Format: user[1-8]@gmail.com
- Password: 'password' (for all accounts)

## Technical Architecture

### Core Features & Implementation

- **Advanced Message Synchronization**

  - Optimistic updates with rollback capability
  - Smart message deduplication in reducer
  - Selective history fetching based on message cache state
  - Atomic message operations with MongoDB transactions

- **Real-time Engine**

  - Socket.IO with Redis adapter for horizontal scaling
  - Room-based pub/sub for efficient message distribution
  - Typing indicator debouncing (frontend) & rate limiting (backend)
  - Automatic reconnection with message backfill

- **State Management**

  - Redux with immer-powered reducers
  - Normalized message cache with separate read/unread buckets
  - Optimistic UI updates with error recovery
  - Intelligent cache invalidation

- **Database & Performance**
  - MongoDB aggregation pipelines for efficient queries
  - Compound indexes on high-traffic queries
  - Cursor-based pagination for message history
  - Lean queries with field selection

## System Architecture

### Database Schema

```typescript
// User Schema
interface User {
  _id: ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  avatar?: string;
  lastSeen: Date;
}

// Chat Schema
interface Chat {
  _id: ObjectId;
  chatName?: string;
  isGroupChat: boolean;
  users: ObjectId[];
  groupAdmin?: ObjectId;
  latestMessage?: ObjectId;
  unreadMessages: { [userId: string]: ObjectId[] };
}

// Message Schema
interface Message {
  _id: ObjectId;
  sender: ObjectId;
  content: string;
  chat: ObjectId;
  readBy: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Core Indexes

```javascript
// Messages
db.messages.createIndex({ chat: 1, createdAt: -1 }); // History queries
db.messages.createIndex({ sender: 1, chat: 1 }); // User message lookups

// Chats
db.chats.createIndex({ users: 1 }); // User's chat list
db.chats.createIndex({ "unreadMessages.userId": 1 }); // Unread tracking

// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
```

## Security Implementation

### Authentication Flow

- JWT-based auth with refresh token rotation
- Password hashing using bcrypt (cost factor 12)
- HTTP-only secure cookies for token storage
- CORS with specific origin validation

### Socket Security

- JWT validation on socket connection
- Room-based access control
- Rate limiting on message events
- Typing indicator throttling

### Data Integrity

- MongoDB transactions for multi-document operations
- Input sanitization using express-validator
- XSS prevention with content sanitization
- File upload validation and scanning

## Performance Optimizations

### Frontend

- Virtualized message lists for DOM performance
- Debounced typing indicators (250ms)
- Optimistic UI updates with rollback
- Efficient reducer updates using immer
- Strategic message cache management
- Lazy-loaded group member lists

### Backend

- Aggregation pipelines for efficient queries
- Cursor-based pagination (20 messages/page)
- Lean queries with field selection
- Index-covered queries where possible
- Socket room-based message distribution
- Redis adapter for horizontal scaling

## API Architecture

### REST Endpoints

All routes are prefix with `/api`

```typescript
// Auth Routes
POST /user/login
  body: { email: string, password: string }
  returns: { token: string, user: User }

POST /user/register
  body: { email: string, username: string, password: string }
  returns: { token: string, user: User }

// Chat Routes
POST /chat
  body: { userId?: string, users?: string[], isGroupChat?: boolean, chatName?: string }
  returns: Chat & { users: User[] }

GET /chat
  returns: (Chat & { users: User[], latestMessage: Message })[]

// Message Routes
GET /message/:chatId
  query: { before?: string, limit?: number }
  returns: { messages: Message[], hasMore: boolean }

POST /message
  body: { content: string, chatId: string }
  returns: Message & { sender: User }
```

### Socket Events

```typescript
// Client -> Server
interface ClientEvents {
  "join chat": (chatId: string) => void;
  "leave chat": (chatId: string) => void;
  "send message": (payload: {
    content: string;
    chatId: string;
    tempId?: string; // For optimistic updates
  }) => void;
  typing: (chatId: string) => void;
  "stop typing": (chatId: string) => void;
}

// Server -> Client
interface ServerEvents {
  connected: () => void;
  "message sent": (
    message: Message & {
      sender: User;
      tempId?: string;
    }
  ) => void;
  "received message": (
    message: Message & {
      sender: User;
    }
  ) => void;
  typing: (payload: { user: User; chatId: string }) => void;
  "stop typing": (payload: { user: User; chatId: string }) => void;
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

ISC License - see [LICENSE](LICENSE) for details

## Author

William Yeboah

## Acknowledgments

- Socket.IO team for the excellent real-time engine
- MongoDB team for the robust database
- React team for the fantastic frontend library

A fast, secure, and seamless real-time chat application for groups, friends, and anyone you can connect with via email or username.

[Live Demo](https://chatapp-amber-rho.vercel.app)

---

## 🚀 Overview

**ChatApp** solves the problem of losing contact with friends or colleagues by allowing you to reconnect and chat instantly if you know their email or username. Designed for both group and individual conversations, it ensures privacy, security, and a smooth user experience.  
The app is highly responsive, easy to navigate, and perfect for all groups of people.

---

## ✨ Features

- **Real-time Messaging:** Instant chat updates using Socket.IO.
- **Typing Indicators:** See when others are typing.
- **Group & Individual Chats:** Create groups or chat one-on-one.
- **Notifications:** Stay updated with real-time notifications.
- **Group Management:** Only admins can add or remove members.
- **Chat Info:** View details about groups or individuals.
- **Authentication:** Secure sign up and sign in with JWT.
- **Responsive UI:** Built with Tailwind CSS for all devices.
- **Cloudinary Integration:** For media and file uploads.
- **Clear, Readable Code:** Ideal for teamwork and future improvements.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Redux, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Real-time:** Socket.IO
- **Media Storage:** Cloudinary
- **Authentication:** JWT (JSON Web Token)

---

## 📦 Getting Started

### Prerequisites

- Node.js & npm/yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/billboah/ChatApp.git
   cd ChatApp
   ```

2. **Set up environment variables:**

   Create a `.env` file in `chat-server/` with the following:

   ```
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongodb_uri
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   ```

3. **Install dependencies:**

   ```bash
   cd chat-server
   npm install
   cd ../chat-app
   npm install
   ```

4. **Run the app:**

   - Start backend:
     ```bash
     cd chat-server
     npm start
     ```
   - Start frontend:
     ```bash
     cd ../chat-app
     npm start
     ```

5. **Visit:**  
   [http://localhost:3000](http://localhost:3000)

---

## ⚠️ Important developer notes — message fetching & messageChats

Recent changes were made to how incoming messages are handled in the frontend reducer to avoid creating message containers automatically for chats that haven't been explicitly loaded by the client yet. Key points:

- The reducer `setNewMessage` (file: `chat-app/src/state/reducers/chat.ts`) no longer creates a new `messageChat` entry when an incoming message arrives for a chat that does not exist in `state.messageChats`.
- Effect: Incoming messages for chats that haven't been loaded will not create a local message bucket automatically. This prevents the client from showing only unread messages for a chat that was not yet fetched after a reconnect/login.
- Expected behavior pattern:
  - When the user selects a chat, the client should fetch the full message history for that chat if it doesn't already exist in `state.messageChats`.
  - If a `messageChat` already exists in state, the client should not re-fetch the full history on selection; instead it may fetch older messages only when pagination is requested (e.g. scrolling to top) and `hasMoreMessages` is true.

Where to change behavior:

- If you prefer automatic creation of `messageChat` objects on incoming messages, edit `setNewMessage` in `chat-app/src/state/reducers/chat.ts` and restore the code block that creates a new message chat when it doesn't exist.
- Chat selection logic lives in the UI components (e.g. `chat-app/src/Chat/chatSidebar/chatList.ts` and `chat-app/src/Chat/chatMessage/index.tsx`). Ensure the selection handler fetches history when a chat is selected and no `messageChat` exists for that chat.

Developer tips:

- Use `updateMessageChats` in the reducer to push bulk historical messages returned from the server (it handles deduplication and pagination flags).
- Keep the server page size in sync with the reducer's `PAGE_SIZE` (currently 20) when making pagination heuristics.
- For testing reconnection flows, sign in, open devtools Network tab, disconnect/reconnect socket, and ensure selecting a chat triggers a history fetch when appropriate.

## 🧑‍💻 Contribution

- Code is clean and readable—ideal for group work and open source contributions.
- Pull requests and suggestions are welcome!

---

## ⚙️ Environment Variables

| Variable     | Description                   |
| ------------ | ----------------------------- |
| JWT_SECRET   | Secret for JWT authentication |
| MONGO_URI    | MongoDB connection string     |
| FRONTEND_URL | Frontend base URL             |
| PORT         | Backend server port           |

---

## 📸 Screenshots

![ChatApp Screenshot](./chat-app/public/image.png)

---

## 📄 License

© 2025 Billboah. All rights reserved.  
This project is proprietary and not licensed for redistribution or commercial use without permission.

---

## 📬 Contact

For questions, feedback, or collaboration, contact wyeboah618@gmail.com .

---
