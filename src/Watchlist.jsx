import React, { useEffect, useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc,} from"firebase/firestore";


export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const { theme, toggleTheme } = useContext(ThemeContext);

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
    if (filter === "anime") return item.category === "anime";
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
    try {
      await addDoc(collection(db, "watched"), {
        ...item,
        status: "completed",
        finishedAt: Date.now(),
      });
      await deleteDoc(doc(db, "watchlist", item.id));
    } catch (err) {
      console.error("Move error:", err);
    }
  };

  const removeItem = async (item) => {
    await deleteDoc(doc(db, "watchlist", item.id));
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
      alignItems: "center",
      justifyContent: "space-between",
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
    info: {
      marginTop: 10,
      fontSize: 14,
    },
    input: {
      width: 50,
      marginLeft: 5,
    },
    done: {
      marginTop: 6,
      width: "100%",
      background: "green",
      color: "white",
      border: "none",
      padding: 6,
      borderRadius: 6,
      cursor: "pointer",
    },
    remove: {
      marginTop: 6,
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
        <h2>Your Watchlist</h2>
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

            <div style={styles.info}>
              <strong>{item.title}</strong>
              <div>⭐ {item.rating}</div>
              <div>{item.type === "movie" ? "Movie" : "TV Show"}</div>

              {item.type === "tv" && (
                <div>
                  Seasons:
                  <input
                    type="number"
                    min="0"
                    max={item.totalSeasons}
                    value={item.seasonsWatched || 0}
                    onChange={(e) => updateSeasons(item, Number(e.target.value))}
                    style={styles.input}
                  />{" "}
                  / {item.totalSeasons}
                </div>
              )}

              <button onClick={() => markCompleted(item)} style={styles.done}>
                ✔ Completed
              </button>
              <button onClick={() => removeItem(item)} style={styles.remove}>
                ❌ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
