import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [seasonsWatched, setSeasonsWatched] = useState({}); // top-level state

  const handleSearch = async () => {
    if (!query) return;

    const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    const res = await fetch(url);
    const data = await res.json();
    setResults(data.results || []);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Search Shows</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies, TV shows, anime..."
      />
      <button onClick={handleSearch}>Search</button>

      <div style={{ marginTop: 20 }}>
        {results.map((item) => {
          const addToWatchlistWithSeasons = async () => {
            const seasons = seasonsWatched[item.id] || 0;

            await addDoc(collection(db, "watchlist"), {
              title: item.title || item.name,
              type: item.media_type,
              poster: item.poster_path,
              rating: item.vote_average,
              seasonsWatched: seasons,
              totalSeasons: item.number_of_seasons || 1,
              status: seasons > 0 ? "watching" : "not started",
            });

            alert(`Added "${item.title || item.name}" to watchlist`);
          };

          return (
            <div key={item.id} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                  alt={item.title || item.name}
                  style={{ borderRadius: 8 }}
                />
              ) : (
                <div style={{ width: 100, height: 150, background: "#ccc" }} />
              )}
              <div>
                <strong>{item.title || item.name}</strong> <br />
                Rating: {item.vote_average} <br />
                Seasons watched:{" "}
                <input
                  type="number"
                  min="0"
                  max={item.number_of_seasons || 1}
                  value={seasonsWatched[item.id] || 0}
                  onChange={(e) =>
                    setSeasonsWatched({
                      ...seasonsWatched,
                      [item.id]: Number(e.target.value),
                    })
                  }
                  style={{ width: 50 }}
                />{" "}
                / {item.number_of_seasons || 1} <br />
                <button onClick={addToWatchlistWithSeasons} style={{ marginTop: 5 }}>
                  Add to Watchlist
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
