import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watchlist"), (snapshot) =>
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsub();
  }, []);

  const filteredItems = items.filter((item) => {

  if (filter === "all") return true;

  const type = item.type?.toLowerCase() || "";
  const category = item.category?.toLowerCase() || "";

  if (filter === "movie") return type === "movie";
  if (filter === "tv") return type === "tv";
  if (filter === "anime") return category === "anime";

  return true;
});

  const updateSeasons = async (item, newValue) => {
    await updateDoc(doc(db, "watchlist", item.id), {
      seasonsWatched: newValue,
      status: newValue >= item.totalSeasons ? "completed" : "watching",
      lastChecked: Date.now(),
    });
  };

  const markCompleted = async (item) => {
    try {
      await addDoc(collection(db, "watched"), {
        ...item,
        type: item.type || "movie",
        category: item.category || "normal",
        status: "completed",
        finishedAt: Date.now(),
      });

      await deleteDoc(doc(db, "watchlist", item.id));
    } catch (err) {
      console.error("Error mocing item:", err);
    }
    };


  const removeFromWatchlist = async (item) => {
    await deleteDoc(doc(db, "watchlist", item.id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Watchlist</h2>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: 20, padding: 5 }}
      >
        <option value="all">All</option>
        <option value="movie">Movies</option>
        <option value="tv">TV Shows</option>
        <option value="anime">Anime</option>
      </select>

      {filteredItems.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            marginBottom: 20,
            gap: 15,
            borderBottom: "1px solid #ddd",
            paddingBottom: 15,
          }}
        >
          {item.poster ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${item.poster}`}
              alt={item.title}
              style={{ width: 100, borderRadius: 8 }}
            />
          ) : (
            <div style={{ width: 100, height: 150, background: "#ccc" }} />
          )}

          <div>
            <strong>{item.title}</strong> <br />
            Rating: {item.rating} <br />
            Type: {item.type === "movie" ? "Movie" : "TV Show"} <br />
            Category: {item.category || "normal"} <br />
            Status: {item.status} <br />

            {item.type === "tv" && (
              <>
                Seasons Watched:{" "}
                <input
                  type="number"
                  min="0"
                  max={item.totalSeasons}
                  value={item.seasonsWatched}
                  style={{ width: 50 }}
                  onChange={(e) =>
                    updateSeasons(item, Number(e.target.value))
                  }
                />{" "}
                / {item.totalSeasons}
                <br />
              </>
            )}

            <button
              style={{ marginTop: 5, marginRight: 5 }}
              onClick={() => markCompleted(item)}
            >
              ✔ Mark as Completed
            </button>

            <button
              style={{ marginTop: 5 }}
              onClick={() => removeFromWatchlist(item)}
            >
              ❌ Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
