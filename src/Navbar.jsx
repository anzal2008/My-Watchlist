import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { useNavigate } from "react-router-dom";

const TMDB_KEY = "3f3a43be23e6ffc9e3acb7fd43f7eea7";

const palette = (theme) => ({
  bg: theme === "dark" ? "oklch(0.15 0.025 264)" : "oklch(0.96 0.005 264)",
  card: theme === "dark" ? "oklch(0.22 0.02 264)" : "oklch(0.99 0.005 260)",
  input: theme === "dark" ? "oklch(0.18 0.02 264)" : "oklch(0.97 0.01 260)",
  border: theme === "dark" ? "oklch(0.28 0.05 264)" : "oklch(0.85 0.02 264)",
  text: theme === "dark" ? "oklch(0.96 0.05 264)" : "oklch(0.15 0.05 264)",
  textMuted: theme === "dark" ? "oklch(0.76 0.05 264)" : "oklch(0.4 0.05 264)",
  primary: theme === "dark" ? "oklch(0.76 0.1 264)" : "oklch(0.4 0.1 264)",
});

export default function NavBar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const colors = palette(theme);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(
            query
          )}`
        );
        const data = await res.json();
        setSuggestions(
          (data.results || [])
            .filter((r) => r.media_type !== "person")
            .sort((a, b) => b.vote_average - a.vote_average)
            .slice(0, 7)
        );
      } catch (err) {
        console.error(err);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSuggestions([]);
  };

  const selectSuggestion = (item) => {
    const name = item.title || item.name;
    setQuery("");
    setSuggestions([]);
    navigate(`/search?q=${encodeURIComponent(name)}`);
  };

  const navStyle = {
    margin: "12px",
    padding: "10px 20px",
    background: colors.bg,
    color: colors.text,
    borderRadius: 16,
    border: `1px solid ${colors.border}`,
    boxShadow:
      theme === "dark"
        ? "0 2px 10px oklch(0% 0 0 / 0.45)"
        : "0 2px 10px oklch(0% 0 0 / 0.12)",
  };

  const navInner = {
    display: "flex",
    alignItem: "center",
    justifyContent: "space-between",
    gap: "12px",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 6,
    background: colors.input,
    color: colors.text,
    outline: "none",
    fontSize: 14,
    border:
      theme === "dark"
        ? "1px solid transparent"
        : `1px solid ${colors.border}`,
    boxShadow: 
      theme === "dark"
        ? `inset 0 -px 0 ${colors.primary}`
        : "none",
  };

  const suggestionStyle = {
    position: "absolute",
    top: "110%",
    width: "100%",
    background: colors.card,
    borderRadius: 6,
    boxShadow:
      theme === "dark"
        ? "0 5px 20px oklch(0% 0 0 / 0.6)"
        : "0 5px 20px oklch(0% 0 0 / 0.15)",
    zIndex: 20,
    overflow: "hidden",
  };

  const suggestionItem = {
    padding: 8,
    cursor: "pointer",
    borderBottom: `1px solid ${colors.border}`,
  };

  const buttonStyle = {
    padding: "6px 12px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    color: colors.text,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(0.75rem,1.4vw, 0.85rem)",
    whiteSpace: "nowrap",
  };

  const iconButtonStyle = {
    ...buttonStyle,
    fontSize: 18,
    padding: "6px 10px",
  };

  return (
    <nav style={navStyle}>
      <div style={navInner}>
        <strong
          style={{ cursor: "pointer", flexShrink: 0 }}
          onClick={() => navigate("/")}
        >
          🎬 WatchApp
        </strong>

        <form 
          onSubmit={handleSearch} 
          style={{ 
            position: "relative", 
            flex: "1 1 240px",
            maxWidth: 360,
            minWidth: 140,
            }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV, anime..."
            style={inputStyle}
          />

          {suggestions.length > 0 && (
            <div style={suggestionStyle}>
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => selectSuggestion(s)}
                  style={suggestionItem}
                >
                  <strong>{s.title || s.name}</strong>{" "}
                  <span style={{ opacity: 0.6 }}>
                    ({s.media_type === "tv" ? "TV" : "Movie"}) ⭐{" "}
                    {s.vote_average.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.card)}
            onMouseLeave={(e) => (e.currentTarget.style.background = colors.bg)}
            onClick={() => navigate("/bulk-add")}
          >
            ➕ Bulk Add
          </button>
          <button
            style={buttonStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.card)}
            onMouseLeave={(e) => (e.currentTarget.style.background = colors.bg)}
            onClick={() => navigate("/watched")}
          >
            ✔ Watched
          </button>
          <button
            style={iconButtonStyle}
            onClick={toggleTheme}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.card)}
            onMouseLeave={(e) => (e.currentTarget.style.background = colors.bg)}
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
        </div>
      </div>
    </nav>
  );
}
