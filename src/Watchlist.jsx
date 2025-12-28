import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Toast = ({ message }) => (
  <div
    style={{
      position: "fixed",
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 20px",
      background: "linear-gradient(135deg, oklch(0.76 0.1 84))",
      color: "white",
      borderRadius: 10,
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: 9999,
    }}
  >
    {message}
  </div>
);

const palette = (theme) => ({
  bg: theme === "dark" ? "oklch(0.15 0.025 264)" : "oklch(0.96 0.005 264)",
  card: theme === "dark" ? "oklch(0.22 0.02 264)" : "oklch(0.99 0.005 260)",
  input: theme === "dark" ? "oklch(0.18 0.02 264)" : "oklch(0.97 0.01 260)",
  border: theme === "dark" ? "oklch(0.28 0.03 264)" : "oklch(0.85 0.02 264)",
  text: theme === "dark" ? "oklch(0.96 0.05 264)" : "oklch(0.15 0.05 264)",
  textMuted: theme === "dark" ? "oklch(0.75 0.04 264)" : "oklch(0.45 0.03 264)",
  success: "oklch(0.7 0.1 150)",
  danger: "oklch(0.6 0.15 25)",
});

export default function Watchlist() {
  const { theme } = useContext(ThemeContext);
  const colors = palette(theme);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeId, setActiveId] = useState(null);
  const [toast, setToast] = useState(null);
  const isTouch = "ontouchstart" in window;

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watchlist"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

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
      ...item,
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

  const cardStyle = (active) => ({
    background: colors.card,
    borderRadius: 16,
    padding: 10,
    border: `1px solid ${colors.border}`,
    boxShadow: active
      ? "0 16px 40px rgba(0,0,0,0.45)"
      : "0 8px 22px rgba(0,0,0,0.15)",
    transform: active ? "translateY(-4px)" : "none",
    transition: "all 0.2s ease",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  });

  const iconButton = (visible, bg) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: bg,
    color: "white",
    fontSize: 18,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
    transition: "opacity 0.2s",
  });

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 16,
  };

  const cardInfo = {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 1.3,
    wordBreak: "break-word",
  };

  return (
    <div style={{ padding: 16, minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <h2 style={{ marginBottom: 16 }}>Your Watchlist</h2>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          marginBottom: 20,
          padding: 8,
          borderRadius: 8,
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

      <div style={gridStyle}>
        {filteredItems.map((item) => {
          const active = activeId === item.id;
          return (
            <div
              key={item.id}
              style={cardStyle(active)}
              onMouseEnter={!isTouch ? () => setActiveId(item.id) : undefined}
              onMouseLeave={!isTouch ? () => setActiveId(null) : undefined}
              onClick={() => isTouch && setActiveId(active ? null : item.id)}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster}`}
                  alt={item.title}
                  style={{ width: "100%", borderRadius: 12 }}
                  onClick={() => navigate(`/details/${item.type}/${item.tmdbId}`)}
                  
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
                    style={iconButton(active, colors.success)}
                    onClick={(e) => {
                      e.stopPropagation();
                      markCompleted(item);
                    }}
                  >
                    ✔
                  </button>
                  <button
                    style={iconButton(active, colors.danger)}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item);
                    }}
                  >
                    ❌
                  </button>
                </div>
              </div>

              <div style={cardInfo}>
                <strong>{item.title}</strong>
                <div>⭐ {item.rating}</div>
                <div>{item.isAnime ? "Anime" : item.type === "movie" ? "Movie" : "TV Show"}</div>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
