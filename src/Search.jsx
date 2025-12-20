import React, { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchTMDB = async () => {
    if (!query) return;
    setLoading(true);

    const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7"; // Your TMDB key
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("TMDB API error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>TMDB Search Test</h2>
      <input
        type="text"
        placeholder="Type a movie or TV show"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, width: "300px", marginRight: 8 }}
      />
      <button onClick={searchTMDB} style={{ padding: "8px 12px" }}>
        Search
      </button>

      {loading && <p>Loading...</p>}

      <div style={{ marginTop: 20 }}>
        {results.length === 0 && !loading && <p>No results yet</p>}

        {results.map((item) => (
          <div
            key={item.id}
            style={{
              padding: 10,
              marginBottom: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {item.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                alt={item.title || item.name}
                style={{ borderRadius: 4 }}
              />
            )}
            <div>
              <strong>{item.title || item.name}</strong>
              <div>Type: {item.media_type}</div>
              <div>Rating: {item.vote_average}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
