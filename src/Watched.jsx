import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

export default function Watched() {
  const { theme } = useContext(ThemeContext);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [hoverId, setHoverId] = useState(null);

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
    .sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0)); // newest first

  const removeWatched = async (item) => {
    await deleteDoc(doc(db, "watched", item.id));
  };

  const actionContainer = {
    position: "absolute",
    bottom: 8,
    right: 8,
    zIndex: 2,
  };

  const iconButton = (active, bg = "rgba(0,0,0,0.75)") => ({
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
    opacity: active ? 1 : 0.45,
    transition: "opacity 0.2s ease, transform 0.2s ease",
  });

  const styles = {
    page: {
      padding: 20,
      minHeight: "100vh",
      background: theme === "dark" ? "#000" : "#f0f0f0",
      color: theme === "dark" ? "white" : "black",
    },
    header: {
      marginBottom: 20,
    },
    select: {
      marginBottom: 20,
      padding: 6,
      background: theme === "dark" ? "#333" : "#fff",
      color: theme === "dark" ? "white" : "black",
      border: "1px solid #999",
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
      background: theme === "dark" ? "#333" : "#ccc",
      borderRadius: 8,
    },
    info: {
      marginTop: 8,
      fontSize: 14,
    },
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
          <div key={item.id}>
            <div
              style={styles.posterWrap}
              onMouseEnter={() => setHoverId(item.id)}
              onMouseLeave={() => setHoverId(null)}
            >
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
                  style={iconButton(hoverId === item.id, "#b00020")}
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
