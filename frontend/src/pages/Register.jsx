import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [profilePic, setProfilePic] = useState(null); // ← new
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !email || !password || !gender) {
      toast.error("All fields are required!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("gender", gender);
      if (profilePic) formData.append("profilePic", profilePic);

      const res = await axios.post(
        "https://chat-app-pug2.onrender.com/api/user/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res.data.message || "Registered successfully!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error occurred!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-md p-8 border border-white/30">
        <h2 className="text-3xl font-bold text-white text-center mb-6 tracking-wide">
          Create Account
        </h2>

        <input
          className="w-full mb-4 px-4 py-3 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full mb-4 px-4 py-3 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 px-4 py-3 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full mb-4 px-4 py-3 rounded-lg bg-white/30 text-white border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {/* Profile Pic Input */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePic(e.target.files[0])}
          className="w-full mb-6 px-4 py-3 rounded-lg bg-white/30 text-white border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
        />

        <button
          onClick={handleRegister}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer rounded-lg shadow-md transition transform hover:-translate-y-1"
        >
          Register
        </button>

        <p className="text-center text-white/70 mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="text-purple-200 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>

      <ToastContainer />
    </div>
  );
}
