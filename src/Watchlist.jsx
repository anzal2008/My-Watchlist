import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import {collection,onSnapshot,doc,updateDoc,deleteDoc,setDoc,} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const palette = (theme) => ({
  bg: theme === "dark"
    ? "oklch(0.15 0.025 264)"
    : "oklch(0.96 0.005 264)",

  card: theme === "dark"
    ? "oklch(0.22 0.02 264)"
    : "oklch(0.99 0.005 260)",

  input: theme === "dark"
    ? "oklch(0.18 0.02 264)"
    : "oklch(0.97 0.01 260)",

  border: theme === "dark"
    ? "oklch(0.28 0.03 264)"
    : "oklch(0.85 0.02 264)",

  text: theme === "dark"
    ? "oklch(0.96 0.05 264)"
    : "oklch(0.15 0.05 264)",

  textMuted: theme === "dark"
    ? "oklch(0.75 0.04 264)"
    : "oklch(0.45 0.03 264)",

  success: "oklch(0.7 0.1 150)",
  danger: "oklch(0.6 0.15 25)",
});

export default function Watchlist() {
  const { theme } = useContext(ThemeContext);
  const colors = palette(theme);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [hoverId, setHoverId] = useState(null);
  const [hoverCard, setHoverCard] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watchlist"), (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "movie") return item.type === "movie";
    if (filter === "tv") return item.type === "tv";
    if (filter === "anime") return item.isAnime === true;
    return true;
  });

  const updateSeasons = async (item, value) => {
    await updateDoc(doc(db, "watchlist", item.id), {
      seasonsWatched: value,
      status: value >= item.totalSeasons ? "completed" : "watching",
      lastChecked: Date.now(),
    });
  };

  const markCompleted = async (item) => {
    const tmdbId = String(item.tmdbId || item.id);

    await setDoc(doc(db, "watched", tmdbId), {
      tmdbId,
      title: item.title,
      type: item.type,
      poster: item.poster,
      rating: item.rating,
      category: item.category || "normal",
      status: "completed",
      finishedAt: Date.now(),
    });

    await deleteDoc(doc(db, "watchlist", item.id));
  };

  const removeItem = async (item) => {
    await deleteDoc(doc(db, "watchlist", item.id));
  };


  const cardStyle = (active) => ({
    background: colors.card,
    borderRadius: 14,
    padding: 10,
    border: `1px solid ${colors.border}`,
    boxShadow: active
      ? theme === "dark"
        ? "0 14px 40px oklch(0% 0 0 / 0.7)"
        : "0 14px 36px oklch(0% 0 0 / 0.18)"
      : theme === "dark"
        ? "0 10px 30px oklch(0% 0 0 / 0.5)"
        : "0 8px 24px oklch(0% 0 0 / 0.12)",
    transform: active ? "translateY(-4px)" : "translateY(0)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  });

  const iconButton = (active, bg) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: bg,
    color: "white",
    cursor: "pointer",
    opacity: active ? 1 : 0,
    transform: active ? "scale(1)" : "scale(0.9)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
    boxShadow: "0 4px 12px oklch(0% 0 0 / 0.4)",
  });

  return (
    <div
      style={{
        padding: 20,
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Your Watchlist</h2>

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
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 20,
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={cardStyle(hoverCard === item.id)}
            onMouseEnter={() => setHoverCard(item.id)}
            onMouseLeave={() => setHoverCard(null)}
          >
            <div
              style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}
              onMouseEnter={() => setHoverId(item.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              {item.poster ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${item.poster}`}
                  alt={item.title}
                  style={{ width: "100%", display: "block", cursor: "pointer" }}
                  onClick={() => navigate(`/details/${item.id}`)}
                />
              ) : (
                <div
                  style={{
                    height: 250,
                    background: colors.input,
                    border: `1px dashed ${colors.border}`,
                  }}
                />
              )}

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
                  onClick={() => markCompleted(item)}
                  title="Mark Completed"
                >
                  ✔
                </button>

                <button
                  style={iconButton(hoverId === item.id, colors.danger)}
                  onClick={() => removeItem(item)}
                  title="Remove"
                >
                  ❌
                </button>
              </div>
            </div>

            <div style={{ marginTop: 8, fontSize: 14, color: colors.textMuted }}>
              <strong style={{ color: colors.text }}>{item.title}</strong>
              <div>⭐ {item.rating}</div>
              <div>
                {item.isAnime 
                  ? "Anime"
                  : item.type === "movie"
                  ? "Movie"
                  : "TV show"}
                </div>

              {item.type === "tv" && (
                <div>
                  Seasons:
                  <input
                    type="number"
                    min="0"
                    max={item.totalSeasons}
                    value={item.seasonsWatched || 0}
                    onChange={(e) =>
                      updateSeasons(item, Number(e.target.value))
                    }
                    style={{
                      width: 50,
                      marginLeft: 6,
                      background: colors.input,
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 4,
                    }}
                  />{" "}
                  / {item.totalSeasons}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
