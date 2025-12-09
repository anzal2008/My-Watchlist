import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function Watchlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watchlist"), (snapshot) =>
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );

    return () => unsub();
  }, []);

  const updateSeasons = async (item, newValue) => {
    await updateDoc(doc(db, "watchlist", item.id), {
      seasonsWatched: newValue,
      status: newValue >= item.totalSeasons ? "completed" : "watching",
      lastChecked: Date.now(),
    });
  };

  const markCompleted = async (item) => {
    await updateDoc(doc(db, "watchlist", item.id), {
      status: "completed",
      finishedAt: Date.now(),
    });
  };

  const removeFromWatchlist = async (item) => {
    await deleteDoc(doc(db, "watchlist", item.id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Watchlist</h2>

      {items.length === 0 && <p>No items in watchlist</p>}

      {items.map((item) => (
        <div
          key={item.id}
          style={{ display: "flex", marginBottom: 20, gap: 15 }}
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
