import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

const palette = (theme) => ({
  bg: theme === "dark" ? "oklch(0.15 0.025 264)" : "oklch(0.96 0.005 264)",
  card: theme === "dark" ? "oklch(0.22 0.02 264)" : "oklch(0.99 0.005 264)",
  border: theme === "dark" ? "oklch(0.28 0.03 264)" : "oklch(0.85 0.02 264)",
  text: theme === "dark" ? "oklch(0.96 0.05 264)" : "oklch(0.15 0.05 264)",
  textMuted: theme === "dark" ? "oklch(0.75 0.04 264)" : "oklch(0.45 0.03 264)",
  danger: "oklch(0.6 0.15 25)",
});

export default function Watched() {
  const { theme } = useContext(ThemeContext);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [hoverId, setHoverId] = useState(null);
  const colors = palette(theme);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watched"), (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filteredItems = items
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "movie") return item.type === "movie";
      if (filter === "tv") return item.type === "tv";
      if (filter === "anime") return item.category === "anime";
      return true;
    })
    .sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));

  const removeWatched = async (item) => {
    await deleteDoc(doc(db, "watched", item.id));
  };

  const actionContainer = {
    position: "absolute",
    bottom: 8,
    right: 8,
    zIndex: 2,
  };

  const iconButton = (active) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: colors.danger,
    color: "white",
    cursor: "pointer",
    opacity: active ? 1 : 0.3,
    transform: active ? "scale(1)" : "scale(0.9)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    boxShadow: "0 4px 12px oklch(0% 0 0 / 0.4)",
  });

  const styles = {
    page: {
      padding: 20,
      minHeight: "100vh",
      background: colors.bg,
      color: colors.text,
    },
    header: {
      marginBottom: 20,
    },
    select: {
      marginBottom: 20,
      padding: 6,
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: 6,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
      gap: 20,
    },
    posterWrap: {
      position: "relative",
    },
    poster: {
      width: "100%",
      borderRadius: 8,
    },
    placeholder: {
      width: "100%",
      height: 250,
      background: colors.bg,
      borderRadius: 8,
    },
    info: {
      marginTop: 8,
      fontSize: 14,
    },
    card: (active) => ({
      background: colors.card,
      borderRadius: 14,
      padding: 10,
      border: `1px solid ${colors.border}`,
      boxShadow: active
        ? "0 16px 40px oklch(0% 0 0 / 0.45)"
        : "0 10px 30px oklch(0% 0 0 / 0.25)",
      transform: active ? "translateY(-4px)" : "translateY(0)",
      transition: "all 0.25s ease",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Watched</h2>
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={styles.select}
      >
        <option value="all">All</option>
        <option value="movie">Movies</option>
        <option value="tv">TV Shows</option>
        <option value="anime">Anime</option>
      </select>

      <div style={styles.grid}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={styles.card(hoverId === item.id)}
            onMouseEnter={() => setHoverId(item.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <div style={styles.posterWrap}>
              {item.poster ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster}`}
                  alt={item.title}
                  style={styles.poster}
                />
              ) : (
                <div style={styles.placeholder} />
              )}

              <div style={actionContainer}>
                <button
                  style={iconButton(hoverId === item.id)}
                  onClick={() => removeWatched(item)}
                  title="Remove"
                >
                  ❌
                </button>
              </div>
            </div>

            <div style={styles.info}>
              <strong>{item.title}</strong>
              <div>⭐ {item.rating}</div>
              <div>{item.type === "movie" ? "Movie" : "TV Show"}</div>
              <div>
                Finished:{" "}
                {item.finishedAt
                  ? new Date(item.finishedAt).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
