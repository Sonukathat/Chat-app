import { useState, useEffect } from "react";
import { socket } from "../socket";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat(prev => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    if (!message) return;
    socket.emit("send_message", { sender: "sonu", text: message });
    setMessage("");
  };

  return (
    <div>
      <div style={{height:"300px", overflowY:"scroll", border:"1px solid gray"}}>
        {chat.map((msg,i)=>(
          <p key={i}><b>{msg.sender}:</b> {msg.text}</p>
        ))}
      </div>
      <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type message..." />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
