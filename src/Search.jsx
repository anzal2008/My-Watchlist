import React, { useContext, useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const { theme } = useContext(ThemeContext);
  const [results, setResults] = useState([]);
  const [seasonsWatched, setSeasonsWatched] = useState({});
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";

      const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("TMDB error:", err);
      }
    };

    fetchResults();
  }, [query]);

  const pageStyle = {
    padding: 20,
    backgroundColor: theme === "dark" ? "#0f0f0f" : "#f5f5f5",
    color: theme === "dark" ? "white" : "#111",
    minHeight: "100vh",
  };

  const cardStyle = {
    backgroundColor: theme === "dark" ? "#111" : "white",
    color: theme === "dark" ? "white" : "#111",
    padding: 10,
    borderRadius: 10,
    position: "relative",
  };

  const buttonStyle = {
    width: "100%",
    marginTop: 6,
    padding: "6px 0",
    cursor: "pointer",
  };

  const actionContainer = {
    position: "absolute",
    bottom: 8,
    right: 8,
    display: "flex",
    gap: 8,
    zIndex: 3,
  };

  const iconButton = (active) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.75)",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: active ? 1 : 0.5,
    transition: "opacity 0.2s ease, transform 0.2s ease",
  });

  const watchedButton = {
    ...iconButton,
    background: "#16a34a",
    color: "white",
  };

  const iconButtonHover = {
    filter: "brightness(1.2)",
  };

  const filteredResults = results
    .filter(
      (item) =>
        (item.media_type === "movie" || item.media_type === "tv") &&
        item.vote_average > 0
    )
    .sort((a, b) => b.vote_average * b.popularity - a.vote_average * a.popularity);

  const addToWatchlist = async (item) => {
    const ref = doc(db, "watchlist", String(item.id));
    const snap = await getDoc(ref);

    if (snap.exists()) {
      alert("Already in watchlist");
      return;
    }

    await setDoc(ref, {
      tmdbId: item.id,
      title: item.title || item.name,
      type: item.media_type,
      poster: item.poster_path,
      rating: item.vote_average,
      seasonsWatched: seasonsWatched[item.id] || 0,
      totalSeasons: 1,
      status: "not started",
      lastChecked: Date.now(),
    });

    alert(`Added "${item.title || item.name}" to watchlist`);
  };

  const markAsWatched = async (item) => {
    const ref = doc(db, "watched", String(item.id));
    const snap = await getDoc(ref);

    if (snap.exists()) {
      alert("Already marked as watched");
      return;
    }

    await setDoc(ref, {
      tmdbId: item.id,
      title: item.title || item.name,
      type: item.media_type,
      poster: item.poster_path,
      rating: item.vote_average,
      status: "completed",
      finishedAt: Date.now(),
    });

    await deleteDoc(doc(db, "watchlist", String(item.id)));

    alert(`Marked "${item.title || item.name}" as watched`);
  };

  return (
    <div style={pageStyle}>
      <h2>Results for “{query}”</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 20, 
        }}
      >
        {filteredResults.map((item, index) => (
          <div
            key={item.id}
            style={cardStyle}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div style={{ position: "relative" }}>
              {index === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "gold",
                    color: "black",
                    fontSize: 12,
                    fontWeight: "bold",
                    padding: "4px 8px",
                    borderRadius: 999,
                    zIndex: 2,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  ⭐ 
                </div>
              )}

              {item.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.title || item.name}
                  style={{ width: "100%", borderRadius: 8 }}
                />
              )}

              <div style={actionContainer}>
                <button
                  style={iconButton(hoveredId === item.id)}
                  onClick={() => addToWatchlist(item)}
                  title="Add to Watchlist"
                >
                  ➕
                </button>

                <button
                  style={{
                    ...iconButton(hoveredId === item.id),
                    background: "#16a34a",
                  }}
                  onClick={() => markAsWatched(item)}
                  title="Mark as Watched"
                >
                  ✓
                </button>
              </div>
            </div>

            <strong>{item.title || item.name}</strong>
            <div>⭐ {item.vote_average}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
