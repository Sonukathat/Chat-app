import User from "../models/userModel.js";

export const register = async (req, res) => {
    try {
        const { username, email, password, gender } = req.body;
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashed, gender });
        res.status(201).json({ message: "user created", user })
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