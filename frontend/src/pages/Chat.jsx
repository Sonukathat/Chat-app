import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import axios from "axios";

export default function Chat() {
    const [users, setUsers] = useState([]);
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUsersMobile, setShowUsersMobile] = useState(true);
    const username = localStorage.getItem("username");

    const messagesEndRef = useRef(null);

    useEffect(() => {
        socket.emit("register_user", username);

        socket.on("users", (data) => setUsers(data));

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
    }, [selectedUser, username]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    useEffect(() => {
        if (!selectedUser) return;
        const fetchMessages = async () => {
            const res = await axios.get(
                `http://localhost:5000/api/messages?user1=${username}&user2=${selectedUser}`
            );
            setChat(res.data);
        };
        fetchMessages();
    }, [selectedUser, username]);

    const sendMessage = () => {
        if (!message.trim() || !selectedUser) return;
        const msg = { sender: username, receiver: selectedUser, text: message };
        socket.emit("send_message", msg);
        setMessage("");
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div
                className={`bg-white border-r p-4 overflow-y-auto w-64 h-full
        fixed md:relative z-20 md:z-auto
        md:translate-x-0 transition-transform duration-300
        ${showUsersMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
            >
                <h2 className="font-bold mb-4 text-xl">Online Users</h2>
                {users.filter((u) => u !== username).map((user, i) => (
                    <div
                        key={i}
                        className={`p-2 cursor-pointer rounded mb-1 ${user === selectedUser ? "bg-purple-200" : "hover:bg-gray-200"
                            }`}
                        onClick={() => {
                            setSelectedUser(user);
                            setShowUsersMobile(false);
                        }}
                    >
                        {user}
                    </div>
                ))}
            </div>

            <div className="flex-1 flex flex-col w-full">
                {selectedUser && (
                    <div className="md:hidden flex items-center p-2 bg-purple-500 text-white">
                        <button
                            onClick={() => setShowUsersMobile(true)}
                            className="mr-2 px-2 py-1 bg-purple-700 rounded"
                        >
                            Back
                        </button>
                        <span className="font-bold">{selectedUser}</span>
                    </div>
                )}

                <div className="flex-1 p-4 overflow-y-auto mt-0 md:mt-0">
                    {selectedUser ? (
                        chat.map((msg, i) => (
                            <div
                                key={i}
                                className={`mb-2 flex ${msg.sender === username ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender === username
                                        ? "bg-purple-500 text-white"
                                        : "bg-gray-200 text-gray-800"
                                        }`}
                                >
                                    <p className="text-sm font-semibold">{msg.sender}</p>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center mt-10">
                            Select a user to start chatting
                        </p>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {selectedUser && (
                    <div className="flex border-t p-2 bg-white">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            className="flex-1 px-4 py-2 rounded-l-md border focus:outline-none"
                            placeholder={`Message ${selectedUser}`}
                        />
                        <button
                            onClick={sendMessage}
                            className="px-4 py-2 bg-purple-500 text-white rounded-r-md hover:bg-purple-600"
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
