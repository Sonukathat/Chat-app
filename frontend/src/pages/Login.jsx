import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload

    if (!email || !password) {
      toast.error("All fields are required!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    try {
      const res = await axios.post(
        "https://chat-app-1-tyex.onrender.com/api/user/login",
        { email, password }
      );

      // Save username, token, and profilePic in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.name);
      localStorage.setItem("profilePic", res.data.profilePic || "");

      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      setTimeout(() => {
        navigate("/chat");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Wrong email or password!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white/20 backdrop-blur-lg rounded-xl shadow-xl w-full max-w-md p-8 border border-white/30"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6 tracking-wide">
          Welcome Back
        </h2>
        <p className="text-center text-white/80 mb-6">
          Login to continue to your chat
        </p>

        <input
          className="w-full mb-4 px-4 py-3 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          placeholder="Email"
          type="email" // browser will validate automatically
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full mb-6 px-4 py-3 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit" // triggers form submit
          className="w-full py-3 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition transform hover:-translate-y-1"
        >
          Login
        </button>

        <p className="text-center text-white/70 mt-4 text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-purple-200 font-semibold cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </form>
      <ToastContainer />
    </div>
  );
}
