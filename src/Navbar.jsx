import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
  };

  return (
    <nav
      style={{
        padding: "10px 20px",
        background: theme === "dark" ? "#141414" : "#f2f2f2",
        color: theme === "dark" ? "#fff" : "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", gap: 20 }}>
        <Link to="/watchlist">Watchlist</Link>
        <Link to="/watched">Watched</Link>
        <Link to="/bulk-add">Bulk Add</Link>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <form onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies or TV..."
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "none",
              outline: "none",
            }}
          />
        </form>

        <button
          onClick={toggleTheme}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
