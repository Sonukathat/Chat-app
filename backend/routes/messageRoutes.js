import express from "express";
import { getMessages, saveMessage } from "../controllers/messageController.js";
const router = express.Router();

router.get("/", getMessages); // ?user1=Sonu&user2=Ankit
router.post("/", saveMessage);

export default router;
