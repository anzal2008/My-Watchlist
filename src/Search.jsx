import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [results, setResults] = useState([]);
  const [seasonsWatched, setSeasonsWatched] = useState({});

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";

      const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
        query
      )}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error("TMDB error:", err);
      }
    };

    fetchResults();
  }, [query]);

  const filteredResults = results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );

  const addToWatchlist = async (item) => {
    await addDoc(collection(db, "watchlist"), {
      tmdbId: item.id,
      title: item.title || item.name,
      type: item.media_type,
      poster: item.poster_path,
      rating: item.vote_average,
      seasonsWatched: seasonsWatched[item.id] || 0,
      totalSeasons: 1,
      status: "not started",
      lastChecked: Date.now(),
    });
  };

  const markAsWatched = async (item) => {
    await addDoc(collection(db, "watched"), {
      tmdbId: item.id,
      title: item.title || item.name,
      type: item.media_type,
      poster: item.poster_path,
      rating: item.vote_average,
      status: "completed",
      finishedAt: Date.now(),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Results for “{query}”</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 20,
        }}
      >
        {filteredResults.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#111",
              color: "white",
              padding: 10,
              borderRadius: 10,
            }}
          >
            {item.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                alt={item.title || item.name}
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}

            <strong>{item.title || item.name}</strong>
            <div>⭐ {item.vote_average}</div>

            <button onClick={() => addToWatchlist(item)}>➕ Watchlist</button>
            <button onClick={() => markAsWatched(item)}>✔ Watched</button>
          </div>
        ))}
      </div>
    </div>
  );
}
