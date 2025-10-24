import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { username, email, password, gender } = req.body;

        if (!username || !email || !password || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashed = await bcrypt.hash(password, 10);

        // req.file.path contains Cloudinary URL
        const profilePic = req.file
            ? req.file.path
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        const user = await User.create({
            username,
            email,
            password: hashed,
            gender: gender.toLowerCase(),
            profilePic,
        });

        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "user not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "wrong password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.status(200).json({
            message: "login succesfull",
            token,
            name: user.username,
            profilePic: user.profilePic ? user.profilePic : "",
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username profilePic");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
};