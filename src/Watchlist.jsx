import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/* ---------- TOAST ---------- */
const Toast = ({ message }) => (
  <div
    style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      padding: "12px 20px",
      background: "linear-gradient(135deg, oklch(0.76 0.1 84))",
      color: "white",
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: 9999,
    }}
  >
    {message}
  </div>
);

/* ---------- COLORS ---------- */
const palette = (theme) => ({
  bg: theme === "dark" ? "oklch(0.15 0.025 264)" : "oklch(0.96 0.005 264)",
  card: theme === "dark" ? "oklch(0.22 0.02 264)" : "oklch(0.99 0.005 260)",
  input: theme === "dark" ? "oklch(0.18 0.02 264)" : "oklch(0.97 0.01 260)",
  border: theme === "dark" ? "oklch(0.28 0.03 264)" : "oklch(0.85 0.02 264)",
  text: theme === "dark" ? "oklch(0.96 0.05 264)" : "oklch(0.15 0.05 264)",
  textMuted:
    theme === "dark" ? "oklch(0.75 0.04 264)" : "oklch(0.45 0.03 264)",
  success: "oklch(0.7 0.1 150)",
  danger: "oklch(0.6 0.15 25)",
});

/* ---------- COMPONENT ---------- */
export default function Watchlist() {
  const { theme } = useContext(ThemeContext);
  const colors = palette(theme);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [hoverId, setHoverId] = useState(null);
  const [toast, setToast] = useState(null);

  /* ---------- FIRESTORE ---------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watchlist"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  /* ---------- HELPERS ---------- */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "movie") return item.type === "movie";
    if (filter === "tv") return item.type === "tv";
    if (filter === "anime") return item.isAnime;
    return true;
  });

  const markCompleted = async (item) => {
    await setDoc(doc(db, "watched", String(item.tmdbId)), {
      tmdbId: item.tmdbId,
      title: item.title,
      type: item.type,
      poster: item.poster,
      rating: item.rating,
      isAnime: item.isAnime,
      status: "completed",
      finishedAt: Date.now(),
    });

    await deleteDoc(doc(db, "watchlist", item.id));
    showToast(`${item.title} marked as completed`);
  };

  const removeItem = async (item) => {
    await deleteDoc(doc(db, "watchlist", item.id));
    showToast(`${item.title} removed`);
  };

  /* ---------- STYLES ---------- */
  const cardStyle = (active) => ({
    background: colors.card,
    borderRadius: 14,
    padding: 10,
    border: `1px solid ${colors.border}`,
    boxShadow: active
      ? "0 14px 40px rgba(0,0,0,0.4)"
      : "0 8px 24px rgba(0,0,0,0.25)",
    transform: active ? "translateY(-4px)" : "none",
    transition: "all 0.2s ease",
  });

  const iconButton = (visible, bg) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: bg,
    color: "white",
    cursor: "pointer",
    opacity: visible ? 1 : 0,
    transform: visible ? "scale(1)" : "scale(0.9)",
  });

  /* ---------- RENDER ---------- */
  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
      }}
    >
      <h2>Your Watchlist</h2>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          marginBottom: 20,
          padding: 6,
          borderRadius: 6,
          background: colors.input,
          color: colors.text,
          border: `1px solid ${colors.border}`,
        }}
      >
        <option value="all">All</option>
        <option value="movie">Movies</option>
        <option value="tv">TV Shows</option>
        <option value="anime">Anime</option>
      </select>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 20,
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={cardStyle(hoverId === item.id)}
            onMouseEnter={() => setHoverId(item.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <div style={{ position: "relative" }}>
              <img
                src={`https://image.tmdb.org/t/p/w300${item.poster}`}
                alt={item.title}
                style={{ width: "100%", cursor: "pointer" }}
                onClick={() =>
                  navigate(`/details/${item.type}/${item.tmdbId}`)
                }
              />

              <div
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  display: "flex",
                  gap: 8,
                }}
              >
                <button
                  style={iconButton(hoverId === item.id, colors.success)}
                  onClick={(e) => {
                    e.stopPropagation();
                    markCompleted(item);
                  }}
                >
                  ✔
                </button>

                <button
                  style={iconButton(hoverId === item.id, colors.danger)}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item);
                  }}
                >
                  ❌
                </button>
              </div>
            </div>

            <div style={{ marginTop: 8, fontSize: 14 }}>
              <strong>{item.title}</strong>
              <div>⭐ {item.rating}</div>
              <div>
                {item.isAnime
                  ? "Anime"
                  : item.type === "movie"
                  ? "Movie"
                  : "TV Show"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
