import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

export default function Watched() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "watched"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  const removeItem = async (id) => {
    await deleteDoc(doc(db, "watched", id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Completed Shows / Movies</h2>

      {items.length === 0 && <p>You haven't finished anything yet</p>}

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
            Finished At:{" "}
            {item.finishedAt
              ? new Date(item.finishedAt).toLocaleDateString()
              : "Unknown"}{" "}
            <br />

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
