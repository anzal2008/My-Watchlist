import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function BulkAdd() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";

  const handleSearchList = async () => {
    setLoading(true);

    const titles = input
      .split(/ {2,}|\n|,\s*/g)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const fetched = [];

    for (const title of titles) {
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
        title
      )}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        const item = data.results?.[0];

        if (item) {
          let totalSeasons = 1;

          if (item.media_type === "tv") {
            const tvDetailsURL = `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}`;
            const tvRes = await fetch(tvDetailsURL);
            const tvData = await tvRes.json();
            totalSeasons = tvData.number_of_seasons || 1;
          }

          fetched.push({
            id: item.id,
            title: item.name || item.title,
            poster: item.poster_path,
            rating: item.vote_average,
            type: item.media_type,
            totalSeasons,
            seasonsWatched: 0,
            status: "not started",
          });
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    }

    setResults(fetched);
    setLoading(false);
  };

  const addItem = async (item) => {
    await addDoc(collection(db, "watchlist"), item);
    alert(`Added "${item.title}"`);
  };

  const addAll = async () => {
    for (const item of results) {
      await addDoc(collection(db, "watchlist"), item);
    }
    alert("All items added!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Bulk Add Shows / Movies / Anime</h2>

      <p>Paste your list here (one title per line):</p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Attack on Titan&#10;Breaking Bad&#10;Inception&#10;One Piece&#10;Jujutsu Kaisen"
        rows={10}
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />

      <button
        onClick={handleSearchList}
        style={{ marginTop: 10, padding: "8px 12px", fontSize: 16 }}
      >
        Search Titles
      </button>

      {loading && <p>Searching TMDB...</p>}

      {results.length > 0 && (
        <>
          <h3 style={{ marginTop: 20 }}>Results</h3>

          <button
            onClick={addAll}
            style={{
              padding: "8px 12px",
              background: "green",
              color: "white",
              borderRadius: 6,
              marginBottom: 20,
            }}
          >
            Add All to Watchlist
          </button>

          {results.map((item) => (
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
                Type: {item.type} <br />
                {item.type === "tv" && (
                  <>Seasons: {item.totalSeasons} <br /></>
                )}

                <button
                  onClick={() => addItem(item)}
                  style={{
                    marginTop: 5,
                    background: "#007bff",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: 5,
                  }}
                >
                  Add Individually
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
