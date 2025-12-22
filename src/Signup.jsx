import React, { useState, useContext } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

export default function Signup() {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/watchlist");
    } catch (err) {
      alert(err.message);
    }
  };

  /* ---------- STYLES ---------- */

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
    padding: "10px 12px", // normal padding
    marginBottom: 14,
    borderRadius: 8,
    border: "1px solid #999",
    background: theme === "dark" ? "#1c1c1c" : "#fff",
    color: theme === "dark" ? "white" : "#111",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
  };

  const passwordWrapper = {
    position: "relative",
    marginBottom: 14,
  };

  const passwordInput = {
    ...input,
    paddingRight: 40, // room for eye icon
  };

  const eyeButton = {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    opacity: 0.6,
    color: theme === "dark" ? "white" : "#111",
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

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Create Account</h2>

        {/* EMAIL INPUT */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input} // normal padding
        />

        {/* PASSWORD WITH EYE ICON */}
        <div style={passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={passwordInput} // right padding for icon
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={eyeButton}
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🦍" : "👁️"}
          </button>
        </div>

        <button
          onClick={signup}
          style={{ ...button, background: "#16a34a", color: "white" }}
        >
          Sign Up
        </button>

        <p style={{ textAlign: "center", marginTop: 16 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#e50914", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
