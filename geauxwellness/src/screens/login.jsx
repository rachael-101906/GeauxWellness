
  // Demo user (import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const navigate = useNavigate();
replace with real auth call)
  const user = { username: "admin", password: "1234" };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === user.username && password === user.password) {
      setMessageColor("green");
      setMessage("Login successful!");
      localStorage.setItem("loggedIn", "true");
      // redirect after short delay; adjust path as needed
      setTimeout(() => navigate("/"), 400);
    } else {
      setMessageColor("red");
      setMessage("Invalid username or password");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", marginTop: 80 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: 10, width: 240 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: 10, width: 240 }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
            Login
          </button>
        </div>
      </form>
      <p style={{ color: messageColor, marginTop: 16 }}>{message}</p>
    </div>
  );
}