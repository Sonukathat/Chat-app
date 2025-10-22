import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import axios from "axios";

export default function Chat() {
  const [chat, setChat] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const username = localStorage.getItem("username");

  // Fetch previous messages from DB
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/messages");
        setChat(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMessages();
  }, []);

  // Socket listeners
  useEffect(() => {
    socket.emit("register_user", username);

    socket.on("users", (data) => setUsers(data));
    socket.on("receive_message", (data) => setChat(prev => [...prev, data]));

    return () => {
      socket.off("users");
      socket.off("receive_message");
    };
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const msg = {
      sender: username,
      text: message,
      receiver: selectedUser
    };

    socket.emit("send_message", msg); // broadcast to all
    setMessage("");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Users Sidebar */}
      <div className={`bg-white shadow-md overflow-y-auto transition-all duration-300
                      ${selectedUser ? "hidden md:block w-1/4" : "w-full md:w-1/4"}`}>
        <h2 className="text-xl font-semibold p-4 border-b">Online Users</h2>
        <ul>
          {users.filter(u => u !== username).map((user, i) => (
            <li
              key={i}
              className="p-4 cursor-pointer hover:bg-gray-200 border-b"
              onClick={() => setSelectedUser(user)}
            >
              {user}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      {selectedUser ? (
        <div className="flex flex-col flex-1 bg-white shadow-md">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between md:hidden">
            <button
              className="text-blue-500 font-semibold"
              onClick={() => setSelectedUser(null)}
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold">{selectedUser}</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {chat
              .filter(msg => msg.sender === selectedUser || msg.receiver === selectedUser || msg.sender === username)
              .map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 flex ${msg.sender === username ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-xs
                                ${msg.sender === username ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
                  >
                    <p className="text-sm font-semibold">{msg.sender}</p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex border-t p-2">
            <input
              className="flex-1 px-4 py-2 rounded-l-md border focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-r-md transition-colors"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
          Select a user to start chat
        </div>
      )}
    </div>
  );
}
