import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

export default function Watched() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watched"), (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    const type = item.type?.toLowerCase();
    const category = item.category?.toLowerCase();

    if (filter === "movie") return type === "movie";
    if (filter === "tv") return type === "tv";
    if (filter === "anime") return category === "anime";
    return true;
  });

  const removeWatched = async (item) => {
    await deleteDoc(doc(db, "watched", item.id));
  };

  const styles = {
    page: {
      padding: 20,
      minHeight: "100vh",
      background: theme === "dark" ? "#000" : "#f0f0f0",
      color: theme === "dark" ? "white" : "black",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    toggleButton: {
      padding: "6px 12px",
      cursor: "pointer",
      borderRadius: 6,
      border: "none",
      background: theme === "dark" ? "#fff" : "#111",
      color: theme === "dark" ? "#111" : "#fff",
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
    card: {
      background: theme === "dark" ? "#111" : "#fff",
      borderRadius: 10,
      padding: 10,
      flexShrink: 0,
      transition: "transform 0.2s ease",
      color: theme === "dark" ? "white" : "black",
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
    remove: {
      marginTop: 8,
      width: "100%",
      background: "#b00020",
      color: "white",
      border: "none",
      padding: 6,
      borderRadius: 6,
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Watched Shows / Movies</h2>
        <button style={styles.toggleButton} onClick={toggleTheme}>
          {theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
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
            style={styles.card}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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

            <strong>{item.title}</strong>
            <br />
            Rating: {item.rating}
            <br />
            Type: {item.type === "movie" ? "Movie" : "TV Show"}
            <br />
            Category: {item.category || "normal"}
            <br />

            <button onClick={() => removeWatched(item)} style={styles.remove}>
              ❌ Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
