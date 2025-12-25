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

  /* ---------- STYLES ---------- */

  const pageStyle = {
    padding: 24,
    background:
      theme === "dark"
        ? "oklch(14% 0.01 250)"
        : "oklch(98% 0.01 250)",
    color: theme === "dark" ? "white" : "black",
    minHeight: "100vh",
  };

  const cardStyle = {
    background:
      theme === "dark"
        ? "oklch(22% 0.015 250)"
        : "oklch(96% 0.01 250)",
    borderRadius: 18,
    padding: 12,
    boxShadow:
      theme === "dark"
        ? "0 8px 24px rgba(0,0,0,0.4)"
        : "0 8px 24px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  const posterStyle = {
    width: "100%",
    borderRadius: 12,
    display: "block",
  };

  const actionContainer = {
    position: "absolute",
    bottom: 10,
    right: 10,
    display: "flex",
    gap: 8,
    zIndex: 3,
  };

  const iconButton = (visible, bg) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: bg,
    color: "white",
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: visible ? 1 : 0,
    transform: visible ? "scale(1)" : "scale(0.9)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
  });

  /* ---------- DATA ---------- */

  const filteredResults = results
    .filter(
      (item) =>
        (item.media_type === "movie" || item.media_type === "tv") &&
        item.vote_average > 0
    )
    .sort((a, b) => b.vote_average * b.popularity - a.vote_average * a.popularity);

  /* ---------- ACTIONS ---------- */

  const addToWatchlist = async (item) => {
    const ref = doc(db, "watchlist", String(item.id));
    const snap = await getDoc(ref);

    if (snap.exists()) return alert("Already in watchlist");

    await setDoc(ref, {
      tmdbId: item.id,
      title: item.title || item.name,
      type: item.media_type,
      poster: item.poster_path,
      rating: item.vote_average,
      status: "not started",
      lastChecked: Date.now(),
    });

    alert(`Added "${item.title || item.name}" to watchlist`);
  };

  const markAsWatched = async (item) => {
    const ref = doc(db, "watched", String(item.id));
    const snap = await getDoc(ref);

    if (snap.exists()) return alert("Already marked as watched");

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

  /* ---------- RENDER ---------- */

  return (
    <div style={pageStyle}>
      <h2 style={{ marginBottom: 20 }}>Results for “{query}”</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 24,
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
                    background: "oklch(85% 0.16 85)",
                    color: "black",
                    fontSize: 12,
                    fontWeight: "bold",
                    padding: "4px 10px",
                    borderRadius: 999,
                    zIndex: 2,
                  }}
                >
                  ⭐ Top
                </div>
              )}

              {item.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                  alt={item.title || item.name}
                  style={posterStyle}
                />
              )}

              <div style={actionContainer}>
                <button
                  style={iconButton(
                    hoveredId === item.id,
                    "oklch(55% 0.18 260)"
                  )}
                  onClick={() => addToWatchlist(item)}
                  title="Add to Watchlist"
                >
                  ➕
                </button>

                <button
                  style={iconButton(
                    hoveredId === item.id,
                    "oklch(60% 0.18 145)"
                  )}
                  onClick={() => markAsWatched(item)}
                  title="Mark as Watched"
                >
                  ✓
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <strong>{item.title || item.name}</strong>
              <div style={{ opacity: 0.65 }}>
                ⭐ {item.vote_average.toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
