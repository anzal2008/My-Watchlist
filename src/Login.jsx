import React, { useState, useContext } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

const colors = {
  bgLight: "oklch(96% 0.01 260)",
  bgDark: "oklch(18% 0.02 260)",
  cardLight: "oklch(99% 0.005 260)",
  cardDark: "oklch(22% 0.02 260)",
  inputLight: "oklch(97% 0.01 260)",
  inputDark: "oklch(26% 0.02 260)",
  border: "oklch(70% 0.02 260)",
  textLight: "oklch(20% 0.02 260)",
  textDark: "oklch(96% 0.01 260)",
  danger: "oklch(62% 0.21 25)",
  dangerHover: "oklch(58% 0.21 25)",
};

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
    padding: "20px", // Added padding for small screens
    background: theme === "dark" ? colors.bgDark : colors.bgLight,
  };

  const card = {
    width: "100%",
    maxWidth: 400, // ensures desktop doesn't stretch too far
    padding: "28px 20px",
    borderRadius: 12,
    background: theme === "dark" ? colors.cardDark : colors.cardLight,
    color: theme === "dark" ? colors.textDark : colors.textLight,
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
    background: theme === "dark" ? colors.inputDark : colors.inputLight,
    color: theme === "dark" ? colors.textDark : colors.textLight,
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
    fontSize: 14,
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

  const footerText = {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 20, fontSize: 22 }}>
          Welcome Back
        </h2>

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
          <span
            style={eyeIcon}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🦍" : "👁️"}
          </span>
        </div>

        <button
          onClick={login}
          style={{ ...button, background: colors.danger, color: "white" }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = colors.dangerHover)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = colors.danger)
          }
        >
          Login
        </button>

        <button
          onClick={resetPassword}
          style={{
            ...button,
            background: "transparent",
            color:
              theme === "dark" ? "oklch(75% 0.02 260)" : "oklch(40% 0.02 260)",
          }}
        >
          Forgot password?
        </button>

        <p style={footerText}>
          Don’t have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: colors.danger,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
