import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 🔹 Track connected users
let users = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  users.push(socket.id);

  // send updated user list to all clients
  io.emit("users", users);

  // handle message event
  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    users = users.filter((id) => id !== socket.id);
    io.emit("users", users);
  });
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
