import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import Message from "./models/messageModel.js"; // ← new

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
  res.send("hello...")
})

app.use("/api/user", userRoutes);
app.use("/api/messages", messageRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// socket users
const users = {}; // socket.id → username mapping

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register_user", (username) => {
    users[socket.id] = username;
    io.emit("users", Object.values(users));
    console.log(`${username} connected`);
  });

  // send message → save in DB
  socket.on("send_message", async (data) => {
    try {
      const newMessage = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        text: data.text
      });
      io.emit("receive_message", newMessage);
    } catch (err) {
      console.log("Error saving message:", err.message);
    }
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit("users", Object.values(users));
    console.log(`${username} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
