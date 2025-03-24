import { Server } from "socket.io";
import dataUser from "../Backend/controllers/userController.js";
let io;
async function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("markNotificationAsRead", async (data) => {
      //   console.log(`Received notification read event:`, data);
      const { task_id, update_at } = data;
      await dataUser.updateNofi(task_id, update_at);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getSocketIO() {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
}

export { setupSocket, getSocketIO };
