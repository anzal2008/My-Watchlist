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
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Detect mobile / small screens
  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    setIsMobile(media.matches);
    const listener = () => setIsMobile(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);
    const t = setTimeout(async () => {
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
            .slice(0, 6)
        );
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
    setSuggestions([]);
  };

  const selectSuggestion = (item) => {
    const name = item.title || item.name;
    setQuery("");
    setSuggestions([]);
    navigate(`/search?q=${encodeURIComponent(name)}`);
  };

  /* ---------- STYLES ---------- */
  const iconBtn = {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    color: colors.text,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.input,
    color: colors.text,
    outline: "none",
    fontSize: 14,
  };

  const suggestionStyle = {
    position: "absolute",
    top: "110%",
    left: 0,
    right: 0,
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

  const menuDropdown = {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: 12,
    boxShadow:
      theme === "dark"
        ? "0 5px 20px oklch(0% 0 0 / 0.6)"
        : "0 5px 20px oklch(0% 0 0 / 0.15)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    zIndex: 20,
    minWidth: 140,
  };

  const menuItem = {
    padding: "8px 12px",
    borderRadius: 12,
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    cursor: "pointer",
    textAlign: "center",
  };

  return (
    <nav
      style={{
        margin: 12,
        padding: "10px 14px",
        borderRadius: 16,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "nowrap",
          justifyContent: "space-between",
        }}
      >
        {/* WATCHAPP SYMBOL */}
        <div
          style={{ cursor: "pointer", flexShrink: 0 }}
          onClick={() => navigate("/")}
        >
          🎬
        </div>

        {/* SEARCH ALWAYS VISIBLE */}
        <form
          onSubmit={handleSearch}
          style={{
            flex: "1 1 150px",
            position: "relative",
            margin: "0 12px",
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
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

        {/* HAMBURGER MENU ALWAYS RIGHT */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            style={iconBtn}
            onClick={() => setMenuOpen((prev) => !prev)}
            title="Menu"
          >
            ☰
          </button>
          {menuOpen && (
            <div style={menuDropdown}>
              <div
                style={menuItem}
                onClick={() => {
                  navigate("/bulk-add");
                  setMenuOpen(false);
                }}
              >
                ➕ Bulk Add
              </div>
              <div
                style={menuItem}
                onClick={() => {
                  navigate("/watched");
                  setMenuOpen(false);
                }}
              >
                ✔ Watched
              </div>
              <div
                style={menuItem}
                onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                }}
              >
                {theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode"}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
