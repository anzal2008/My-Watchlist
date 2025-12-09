import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [seasonsWatched, setSeasonsWatched] = useState({}); // store season values per item

  const handleSearch = async () => {
    if (!query) return;

    const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
      query
    )}`; 

    try {
      const res = await fetch(url);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("TMDB fetch error:", err);
      alert("Error fetching search results — check console.");
    }
  };

  // Add to Watchlist BUTTON
  const addToWatchlist = async (item) => {
  try {
    const seasons = seasonsWatched[item.id] || 0;

    let totalSeasons = 1;

    // If TV show → fetch full details to get number_of_seasons
    if (item.media_type === "tv") {
      const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";
      const detailsRes = await fetch(
        `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}`
      );
      const details = await detailsRes.json();
      totalSeasons = details.number_of_seasons || 1;
    }

    await addDoc(collection(db, "watchlist"), {
      tmdbId: item.id,
      title: item.title || item.name,
      type: item.media_type,
      poster: item.poster_path,
      rating: item.vote_average,
      seasonsWatched: seasons,
      totalSeasons,
      status: seasons > 0 ? "watching" : "not started",
      lastChecked: Date.now(),
      finishedAt: null,
    });

    alert(`Added "${item.title || item.name}" to watchlist`);
  } catch (err) {
    console.error("Error adding to watchlist:", err);
    alert("Failed to add to watchlist — see console.");
  }
};

  // Already Watched BUTTON
const markAsWatched = async (item) => {
  try {
    let totalSeasons = 1;

    if (item.media_type === "tv") {
      const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";
      const detailsRes = await fetch(
        `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}`
      );
      const details = await detailsRes.json();
      totalSeasons = details.number_of_seasons || 1;
    }

    await addDoc(collection(db, "watched"), {
      tmdbId: item.id,
      title: item.title || item.name,
      type: item.media_type,
      poster: item.poster_path,
      rating: item.vote_average,
      seasonsWatched: totalSeasons,
      totalSeasons,
      status: "completed",
      lastChecked: Date.now(),
      finishedAt: Date.now(),
    });

    alert(`Marked "${item.title || item.name}" as watched`);
  } catch (err) {
    console.error("Error marking as watched:", err);
    alert("Failed to mark as watched — see console.");
  }
};


  return (
    <div style={{ padding: 20 }}>
      <h2>Search</h2>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Movies or TV Shows"
      />
      <button onClick={handleSearch}>Search</button>

      <div style={{ marginTop: 20 }}>
        {results.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              marginBottom: 20,
              gap: 10,
              alignItems: "center",
            }}
          >
            {item.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                alt={item.title || item.name}
                style={{ width: 100, borderRadius: 8 }}
              />
            ) : (
              <div style={{ width: 100, height: 150, background: "#ccc" }} />
            )}

            <div>
              <strong>{item.title || item.name}</strong> <br />
              Rating: {item.vote_average} <br />

              {/* Input ONLY for TV shows */}
              {item.media_type === "tv" && (
                <>
                  Seasons Watched:{" "}
                  <input
                    type="number"
                    min="0"
                    max={item.number_of_seasons || 1}
                    value={seasonsWatched[item.id] ?? ""} // empty if not set
                    onChange={(e) =>
                      setSeasonsWatched({
                        ...seasonsWatched,
                        [item.id]: Number(e.target.value),
                      })
                    }
                    style={{ width: 50 }}
                  />{" "}
                  / {item.number_of_seasons || 1}
                  <br />
                </>
              )}

              <button
                style={{ marginTop: 5, marginRight: 5 }}
                onClick={() => addToWatchlist(item)}
              >
                ➕ Add to Watchlist
              </button>

              <button style={{ marginTop: 5 }} onClick={() => markAsWatched(item)}>
                ✔ Already Watched
              </button>
            </div>
          </div>
        ))} 
      </div>
    </div>
  );
}

// 2 buttons on top foir watched and to be done 
// add sorting feature
