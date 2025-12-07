import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query) return;

    const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7"; 
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Error fetching TMDB data:", err);
    }
  };

  const addToWatchlist = async (item) => {
    try {
      await addDoc(collection(db, "watchlist"), {
        title: item.title || item.name,
        type: item.media_type,
        poster: item.poster_path,
        rating: item.vote_average,
      });
      alert(`Added "${item.title || item.name}" to watchlist`);
    } catch (err) {
      console.error("Error adding document:", err);
    }
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
        {results.map((item) => (
          <div key={item.id} style={{ marginBottom: 10 }}>
            <strong>{item.title || item.name}</strong> | Rating: {item.vote_average}
            <button onClick={() => addToWatchlist(item)} style={{ marginLeft: 10 }}>
              Add to Watchlist
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
