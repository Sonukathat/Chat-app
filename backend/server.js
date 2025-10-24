import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import Message from "./models/messageModel.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded profile pics
app.use("/uploads", express.static("uploads"));

app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// socket users: socket.id -> { username, profilePic }
const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register_user", (userData) => {
    // userData = { username, profilePic }
    users[socket.id] = userData;
    io.emit("users", Object.values(users)); // emit full objects
    console.log(`${userData.username} connected`);
  });

  // send message → save in DB
  socket.on("send_message", async (data) => {
    try {
      const newMessage = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text,
        senderProfilePic: data.senderProfilePic || "", // store sender pic
      });
      io.emit("receive_message", newMessage);
    } catch (err) {
      console.log("Error saving message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    delete users[socket.id];
    io.emit("users", Object.values(users));
    console.log(`${user?.username} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
