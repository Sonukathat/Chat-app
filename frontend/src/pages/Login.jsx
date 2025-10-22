import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email, password
      });
      localStorage.setItem("token", res.data.token);
      navigate("/chat"); // login ke baad chat page
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
