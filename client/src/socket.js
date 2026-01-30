import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    transports: ["polling", "websocket"],
    withCredentials: true,
    autoConnect: false // important
});

export default socket;
