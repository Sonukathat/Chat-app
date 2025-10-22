import Message from "../models/messageModel.js";

// Get messages between two users
export const getMessages = async (req, res) => {
  const { user1, user2 } = req.query; // frontend se query params me bhejna
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 }); // old → new
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save message
export const saveMessage = async (req, res) => {
  const { sender, receiver, text } = req.body;
  try {
    const message = await Message.create({ sender, receiver, text });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
