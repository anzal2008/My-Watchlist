import React, { useState, useContext } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

const palette = (theme) => ({
  bg: theme === "dark" ? "oklch(0.18 0.02 260)" : "oklch(0.96 0.01 260)",
  card: theme === "dark" ? "oklch(0.22 0.02 260)" : "oklch(0.99 0.005 260)",
  input: theme === "dark" ? "oklch(0.26 0.02 260)" : "oklch(0.97 0.01 260)",
  text: theme === "dark" ? "oklch(0.96 0.01 260)" : "oklch(0.20 0.02 260)",
  textMuted: theme === "dark" ? "oklch(0.75 0.02 260)" : "oklch(0.45 0.02 260)",
  border: "oklch(70% 0.02 260)",
  success: "oklch(0.68 0.18 155)",
  successHover: "oklch(0.62 0.18 155)",
});

export default function Signup() {
  const { theme } = useContext(ThemeContext);
  const colors = palette(theme);

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

  const page = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px", 
    background: colors.bg,
  };

  const card = {
    width: "100%",
    maxWidth: 400,
    padding: "28px 20px",
    borderRadius: 12,
    background: colors.card,
    color: colors.text,
    boxShadow:
      theme === "dark"
        ? "0 10px 30px oklch(0% 0 0 / 0.6)"
        : "0 10px 30px oklch(0% 0 0 / 0.15)",
    boxSizing: "border-box",
  };

  const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.input,
    color: colors.text,
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box",
    marginBottom: 14,
  };

  const passwordWrapper = {
    position: "relative",
    marginBottom: 14,
  };

  const eyeIcon = {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: 18,
    userSelect: "none",
    color: colors.textMuted,
  };

  const button = {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 6,
    background: colors.success,
    color: "white",
    fontSize: 14,
  };

  const footerText = {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 20, fontSize: 22 }}>
          Create Account
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <div style={passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...input, paddingRight: 40, marginBottom: 0 }}
          />
          <span
            style={eyeIcon}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🦍" : "👁️"}
          </span>
        </div>

        <button
          onClick={signup}
          style={button}
          onMouseEnter={(e) => (e.currentTarget.style.background = colors.successHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = colors.success)}
        >
          Sign Up
        </button>

        <p style={footerText}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: colors.success,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
