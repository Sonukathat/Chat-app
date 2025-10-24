import express from "express";
import { register, login, getAllUsers } from "../controllers/userController.js";
import parser from "../middleware/upload.js";

const router = express.Router();

router.post("/register", parser.single("profilePic"), register);
router.post("/login", login);
router.get('/all',getAllUsers)

export default router;
