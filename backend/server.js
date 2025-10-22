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

app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store users as objects: { id, username }
const users = {}; // socket.id → username mapping

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register_user", (username) => {
    users[socket.id] = username;
    io.emit("users", Object.values(users));
    console.log(`${username} connected`);
  });

  socket.on("send_message", (data) => {
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit("users", Object.values(users));
    console.log(`${username} disconnected`);
  });
});