import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Toast = ({ message }) => (
  <div
    style={{
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 20px",
      background: "linear-gradient(135deg, oklch(0.76 0.1 84), oklch(0.6 0.1 200))",
      color: "white",
      borderRadius: 10,
      boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      zIndex: 9999,
    }}
  >
    {message}
  </div>
);

const palette = (theme) => ({
  bg: theme === "dark" ? "oklch(0.15 0.025 264)" : "oklch(0.96 0.005 264)",
  card: theme === "dark" ? "oklch(0.22 0.02 264)" : "white",
  border: theme === "dark" ? "oklch(0.28 0.03 264)" : "#e5e7eb",
  text: theme === "dark" ? "white" : "black",
  textMuted: theme === "dark" ? "rgba(255,255,255,0.7)" : "#555",
  danger: "oklch(0.6 0.15 25)",
});

export default function Watched() {
  const { theme } = useContext(ThemeContext);
  const colors = palette(theme);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [hoverId, setHoverId] = useState(null);
  const [toast, setToast] = useState(null);
  const [sortByRating, setSortByRating] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watched"), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const removeWatched = async (item) => {
    await deleteDoc(doc(db, "watched", item.id));
    showToast(`${item.title} removed`);
  };

  const filteredItems = items
  .filter((i) =>
    filter === "all" ? true : filter === "anime" ? i.isAnime : i.type === filter
  )
  .sort((a, b) => {
    if (sortByRating) {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA; // highest rating first, 0s naturally go last
    }
    return (b.finishedAt || 0) - (a.finishedAt || 0);
  });


  return (
    <div
      style={{
        minHeight: "100vh",
        padding: isMobile ? 14 : 20,
        background: colors.bg,
        color: colors.text,
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Watched</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: colors.card,
            color: colors.text,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
          <option value="anime">Anime</option>
        </select>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            userSelect: "none",
            color: colors.text,
          }}
        >
          <input
            type="checkbox"
            checked={sortByRating}
            onChange={(e) => setSortByRating(e.target.checked)}
          />
          Rating
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {filteredItems.map((item) => {
          const active = hoverId === item.id || isMobile;

          return (
            <div
              key={item.id}
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                padding: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
              onMouseEnter={() => !isMobile && setHoverId(item.id)}
              onMouseLeave={() => !isMobile && setHoverId(null)}
            >
              <div style={{ position: "relative" }}>
                {item.poster && (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${item.poster}`}
                    alt={item.title}
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      navigate(`/details/${item.type}/${item.tmdbId || item.id}`)
                    }
                  />
                )}

                <button
                  onClick={() => removeWatched(item)}
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background: colors.danger,
                    color: "white",
                    fontSize: 16,
                    opacity: active ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  ❌
                </button>
              </div>

              <div style={{ marginTop: 8, fontSize: 13 }}>
                <strong>{item.title}</strong>
                <div style={{ color: colors.textMuted }}>⭐ {item.rating ?? "—"}</div>
                <div style={{ color: colors.textMuted }}>
                  {item.isAnime ? "Anime" : item.type === "movie" ? "Movie" : "TV"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}
