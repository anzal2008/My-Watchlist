import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

export default function Watched() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watched"), (snapshot) =>
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsub();
  }, []);

  // ----------------------------
  // FILTER SYSTEM (same as Watchlist)
  // ----------------------------
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "anime") return item.category === "anime";
    if (filter === "movie") return item.type === "movie";
    if (filter === "tv") return item.type === "tv";
    return true;
  });

  const removeItem = async (id) => {
    await deleteDoc(doc(db, "watched", id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Completed Shows / Movies</h2>

      {/* Filter Dropdown */}
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

      {filteredItems.length === 0 && (
        <p>No completed items in this category yet.</p>
      )}

      {filteredItems.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            marginBottom: 20,
            gap: 15,
            paddingBottom: 15,
            borderBottom: "1px solid #ddd",
          }}
        >
          {/* Poster */}
          {item.poster ? (
            <img
              src={`https://image.tmdb.org/t/p/w200${item.poster}`}
              alt={item.title}
              style={{ width: 100, borderRadius: 8 }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 150,
                background: "#ccc",
                borderRadius: 8,
              }}
            />
          )}

          {/* Info */}
          <div>
            <strong>{item.title}</strong> <br />
            Rating: {item.rating} <br />
            Type: {item.type === "movie" ? "Movie" : "TV Show"} <br />
            Category: {item.category || "normal"} <br />
            Finished At:{" "}
            {item.finishedAt
              ? new Date(item.finishedAt).toLocaleDateString()
              : "Unknown"}
            <br />

            {/* Only for TV shows */}
            {item.type === "tv" && (
              <>
                Seasons Watched: {item.seasonsWatched} / {item.totalSeasons}
                <br />
              </>
            )}

            <button style={{ marginTop: 5 }} onClick={() => removeItem(item.id)}>
              ❌ Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
