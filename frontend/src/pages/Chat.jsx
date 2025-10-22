import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const username = localStorage.getItem("username") || "Guest";

  useEffect(() => {
    // Register user name dynamically
    socket.emit("register_user", username);
  }, [username]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("users", (data) => {
      setUsers(data);
    });

    return () => {
      socket.off("receive_message");
      socket.off("users");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("send_message", { sender: username, text: message });
    setMessage("");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-gray-800">
      
      {/* Left Sidebar - Users */}
      <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4 mb-4 md:mb-0 md:mr-4 overflow-y-auto">
        <h2 className="text-xl font-semibold text-purple-600 mb-3">Online Users</h2>
        <ul>
          {users.length > 0 ? (
            users.map((user, index) => (
              <li key={index} className="py-2 border-b border-gray-200">{user}</li>
            ))
          ) : (
            <p className="text-gray-500">No users online</p>
          )}
        </ul>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-white shadow-md rounded-lg p-4">
        <div className="flex-1 overflow-y-auto mb-4">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs ${
                  msg.sender === username
                    ? "bg-purple-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="text-sm font-semibold">{msg.sender}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex">
          <input
            className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-r-md transition-colors"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
