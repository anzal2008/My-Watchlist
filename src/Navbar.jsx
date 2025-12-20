import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

export default function NavBar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 20px",
        background: theme === "dark" ? "#111" : "#fff",
        color: theme === "dark" ? "white" : "black",
      }}
    >
      <strong style={{ cursor: "pointer" }} onClick={() => navigate("/watchlist")}>
        🎬 WatchApp
      </strong>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => navigate("/search")}>Search</button>
        <button onClick={() => navigate("/bulk-add")}>Bulk Add</button>
        <button onClick={() => navigate("/watched")}>Watched</button>
        <button onClick={toggleTheme}>
          {theme === "dark" ? "☀" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
