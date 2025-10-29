import { io, Socket } from "socket.io-client";
import { BACKEND_API } from "../config/chatLogics";


export const socket: Socket = io(BACKEND_API, {
  transports: ["websocket"],
  autoConnect: false, // connect manually after login
  auth: (cb) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    cb({ token: user?.token || null });
  },
});

export default socket;
