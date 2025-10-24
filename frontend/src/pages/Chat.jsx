import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import axios from "axios";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const [users, setUsers] = useState([]);          // all registered users
  const [onlineUsers, setOnlineUsers] = useState([]); // only online users
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsersMobile, setShowUsersMobile] = useState(true);

  const username = localStorage.getItem("username");
  const profilePic = localStorage.getItem("profilePic");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const defaultPic = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ✅ Step 1: Fetch all registered users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get("https://chat-app-1-tyex.onrender.com/api/user/all");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchAllUsers();
  }, []);

  // ✅ Step 2: Socket register & track online users
  useEffect(() => {
    socket.emit("register_user", { username, profilePic });

    socket.on("users", (data) => {
      setOnlineUsers(data.map((u) => u.username)); // online users list
    });

    socket.on("receive_message", (data) => {
      if (
        (data.sender === selectedUser && data.receiver === username) ||
        (data.sender === username && data.receiver === selectedUser)
      ) {
        setChat((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("users");
      socket.off("receive_message");
    };
  }, [selectedUser, username, profilePic]);

  // ✅ Step 3: Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ✅ Step 4: Fetch old chat history
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      const res = await axios.get(
        `https://chat-app-1-tyex.onrender.com/api/messages?user1=${username}&user2=${selectedUser}`
      );
      setChat(res.data);
    };
    fetchMessages();
  }, [selectedUser, username]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;
    const msg = { sender: username, receiver: selectedUser, text: message, senderProfilePic: profilePic };
    socket.emit("send_message", msg);
    setMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("profilePic");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-linear-to-r from-indigo-400 via-purple-500 to-pink-500">
      {/* Sidebar */}
      <div
        className={`bg-white/20 backdrop-blur-lg border-r border-white/30 p-4 w-64 h-full
        fixed md:relative z-20 md:z-auto flex flex-col justify-between
        md:translate-x-0 transition-transform duration-300
        ${showUsersMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="overflow-y-auto flex-1">
          <h2 className="font-bold mb-4 text-xl text-white">All Users</h2>

          {users
            .filter((u) => u.username !== username)
            .map((user, i) => (
              <div
                key={i}
                className={`p-2 cursor-pointer rounded mb-2 transition-colors duration-200
                  ${user.username === selectedUser
                    ? "bg-purple-500 text-white font-semibold shadow-md"
                    : "hover:bg-white/30 text-white"
                  }`}
                onClick={() => {
                  setSelectedUser(user.username);
                  setShowUsersMobile(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.profilePic || defaultPic}
                    alt="profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <span>{user.username}</span>
                    {onlineUsers.includes(user.username) && (
                      <p className="text-xs text-green-300">Online</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 p-2 cursor-pointer bg-white/50 rounded"
        >
          <FiLogOut size={20} />
          <span className="font-medium">Logout</span>
        </div>
      </div>

      {/* Chat section */}
      <div
        className="flex-1 flex flex-col w-full bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage:
            "url('927542-3840x2160-desktop-4k-love-couple-background-photo.jpg')",
        }}
      >
        {selectedUser && (
          <div className="md:hidden flex items-center p-2 bg-purple-500 text-white shadow-md">
            <button
              onClick={() => setShowUsersMobile(true)}
              className="mr-2 px-2 py-1 bg-purple-700 rounded hover:bg-purple-800 transition"
            >
              Back
            </button>
            <span className="font-bold text-lg">{selectedUser}</span>
          </div>
        )}

        <div className="flex-1 p-4 overflow-y-auto mt-0 md:mt-0">
          {selectedUser ? (
            chat.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
              >
                {msg.sender !== username && (
                  <img
                    src={msg.senderProfilePic || defaultPic}
                    alt="profile"
                    className="w-6 h-6 rounded-full object-cover mr-2 self-end"
                  />
                )}
                <div
                  className={`px-4 py-2 rounded-xl max-w-xs wrap-break-word shadow-md
                    ${msg.sender === username
                      ? "bg-purple-600 text-white animate-fade-in"
                      : "bg-white/30 text-white backdrop-blur-lg animate-fade-in"
                    }`}
                >
                  <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/80 text-center mt-20 text-lg">
              Select a user to start chatting
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedUser && (
          <div className="flex border-t border-white/30 p-2 bg-white/20 backdrop-blur-lg">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-4 py-3 rounded-l-lg border-none focus:outline-none bg-white/30 text-white placeholder-white/70 backdrop-blur-sm"
              placeholder={`Message ${selectedUser}`}
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-r-lg shadow-md transition transform hover:-translate-y-0.5"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
