import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { username, email, password, gender } = req.body;

        // Simple validation
        if (!username || !email || !password || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if gender is valid
        if (!["male", "female"].includes(gender.toLowerCase())) {
            return res.status(400).json({ message: "Gender must be 'male' or 'female'" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashed,
            gender: gender.toLowerCase()
        });

        res.status(201).json({ message: "User registered", user });
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
        res.status(200).json({ message: "login succesfull", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}