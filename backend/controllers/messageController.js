import Message from "../models/messageModel";

export const getMessages = async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
};

export const saveMessage = async (req, res) => {
  const { sender, text } = req.body;
  const message = await Message.create({ sender, text });
  res.json(message);
};