import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_API_URL || "http://localhost:5000",
  {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true,
  }
);

export default socket;
