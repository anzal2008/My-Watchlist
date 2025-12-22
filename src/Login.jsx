import React, { useState, useContext } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

export default function Login() {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/watchlist");
    } catch (err) {
      alert(err.message);
    }
  };

  const resetPassword = async () => {
    if (!email) return alert("Enter your email first");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent");
    } catch (err) {
      alert(err.message);
    }
  };

  const page = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme === "dark" ? "#0f0f0f" : "#f4f4f4",
  };

  const card = {
    width: 360,
    padding: 28,
    borderRadius: 12,
    background: theme === "dark" ? "#111" : "#fff",
    color: theme === "dark" ? "white" : "#111",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };

  const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #999",
    background: theme === "dark" ? "#1c1c1c" : "#fff",
    color: theme === "dark" ? "white" : "#111",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box", 
  };

  const button = {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 6,
  };

  const passwordWrapper = {
    position: "relative",
    marginBottom: 14,
  };

  const eyeIcon = {
    position: "absolute",
    top: "50%",
    right: 10,
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: 18,
    userSelect: "none",
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Welcome Back</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ ...input, marginBottom: 14 }}
        />

        <div style={passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...input, paddingRight: 40 }} 
          />
          <span style={eyeIcon} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🦍" : "👁️"}
          </span>
        </div>

        <button
          onClick={login}
          style={{ ...button, background: "#e50914", color: "white" }}
        >
          Login
        </button>

        <button
          onClick={resetPassword}
          style={{
            ...button,
            background: "transparent",
            color: theme === "dark" ? "#aaa" : "#444",
          }}
        >
          Forgot password?
        </button>

        <p style={{ textAlign: "center", marginTop: 16 }}>
          Don’t have an account?{" "}
          <Link to="/signup" style={{ color: "#e50914", textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
