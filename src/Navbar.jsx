import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { useNavigate } from "react-router-dom";

const TMDB_KEY = "3f3a43be23e6ffc9e3acb7fd43f7eea7";

export default function NavBar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

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
            .sort((a, b) => b.vote_average - a.vote_average) // ⭐ highest first
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

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: theme === "dark" ? "#111" : "#fff",
        color: theme === "dark" ? "white" : "black",
        position: "relative",
      }}
    >
      <strong style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        🎬 WatchApp
      </strong>

      {/* SEARCH */}
      <form onSubmit={handleSearch} style={{ position: "relative", width: 300 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV, anime..."
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #999",
          }}
        />

        {suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              width: "100%",
              background: theme === "dark" ? "#222" : "#fff",
              borderRadius: 6,
              boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
              zIndex: 20,
            }}
          >
            {suggestions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSuggestion(s)}
                style={{
                  padding: 8,
                  cursor: "pointer",
                  borderBottom: "1px solid #444",
                }}
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

      {/* ACTIONS */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => navigate("/bulk-add")}>➕ Bulk Add</button>
        <button onClick={() => navigate("/watched")}>✔ Watched</button>
        <button onClick={toggleTheme}>
          {theme === "dark" ? "☀" : "🌙"}
        </button>
      </div>
    </nav>
  );
}