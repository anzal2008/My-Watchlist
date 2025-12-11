// src/BulkAdd.jsx
import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export default function BulkAdd() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7"; 

  function normalize(s = "") {
    return (s || "")
      .toLowerCase()
      .replace(/[\u2018\u2019\u201C\u201D"“”']/g, "") 
      .replace(/[^\w\s]/g, "") 
      .replace(/\s+/g, " ")
      .trim();
  }
//fix 
  function levenshtein(a = "", b = "") {
    a = a || "";
    b = b || "";
    const A = normalize(a); 
    const B = normalize(b);
    if (A === B) return 0;
    const m = A.length;
    const n = B.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = A[i - 1] === B[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  function distanceRatio(a, b) {
    const d = levenshtein(a, b);
    const L = Math.max(normalize(a).length, normalize(b).length, 1);
    return d / L;
  }

  async function tmdbSearch(query) {
    const q = encodeURIComponent(query);
    const endpoints = [
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${q}`,
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${q}`,
      `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${q}`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          return data.results;
        }
      } catch (err) {
        console.error("tmdb search error", err);
      }
    }
    return [];
  }

  async function fetchTvSeasonsIfNeeded(item) {
    if (!item || item.media_type !== "tv") return 1;
    try {
      const url = `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      return data?.number_of_seasons || 1;
    } catch {
      return 1;
    }
  }

  function splitByDelimiters(text) {
    const parts = text
      .split(/(?:\r\n|\n|,|;|\||\u2028)|\s{2,}/g) // newlines, commas, semicolons, pipes or 2+ spaces
      .map((t) => t.trim())
      .filter(Boolean);
    return parts;
  }

  async function greedyScanAndResolve(text, maxWords = 8) {
    const tokens = text
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);
    const found = [];
    let i = 0;

    while (i < tokens.length) {
      let matched = null;
      let matchedSpan = 0;

      for (let span = Math.min(maxWords, tokens.length - i); span >= 1; span--) {
        const cand = tokens.slice(i, i + span).join(" ");
        if (cand.length < 2) continue;
        const results = await tmdbSearch(cand);
        if (!results || results.length === 0) continue;

        let best = null;
        let bestRatio = Infinity;
        const top = results.slice(0, 10);
        for (const r of top) {
          const candidateTitle = r.title || r.name || "";
          const ratio = distanceRatio(cand, candidateTitle);
          if (ratio < bestRatio) {
            bestRatio = ratio;
            best = r;
          }
        }

      
        if (best && bestRatio <= 0.45) {
          matched = best;
          matchedSpan = span;
          break; 
        }
      }

      if (matched) {
        const totalSeasons =
          matched.media_type === "tv"
            ? await fetchTvSeasonsIfNeeded(matched)
            : 1;

        found.push({
          id: matched.id,
          title: matched.title || matched.name,
          poster: matched.poster_path,
          rating: matched.vote_average ?? null,
          type: matched.media_type === "movie" ? "movie" : matched.media_type === "tv" ? "tv" : "movie",
          totalSeasons,
          seasonsWatched: 0,
          status: "not started",
          rawMatch: tokens.slice(i, i + matchedSpan).join(" "),
        });
        i += matchedSpan; 
      } else {
        found.push({
          id: null,
          title: tokens[i],
          poster: null,
          rating: null,
          type: "unknown",
          totalSeasons: 1,
          seasonsWatched: 0,
          status: "not found",
          rawMatch: tokens[i],
        });
        i += 1;
      }
    }

    return found;
  }


  const handleSearchList = async () => {
    setLoading(true);
    setResults([]);

    const parts = splitByDelimiters(input);

    let candidates = [];

    if (parts.length > 1 && parts.some((p) => p.split(" ").length > 1)) {
      for (const rawTitle of parts) {
        try {
          const list = await tmdbSearch(rawTitle);
          if (list && list.length > 0) {
            let best = null;
            let bestRatio = Infinity;
            for (const r of list.slice(0, 8)) {
              const candidateTitle = r.title || r.name || "";
              const ratio = distanceRatio(rawTitle, candidateTitle);
              if (ratio < bestRatio) {
                bestRatio = ratio;
                best = r;
              }
            }
            if (best && bestRatio <= 0.6) {
              const totalSeasons = best.media_type === "tv" ? await fetchTvSeasonsIfNeeded(best) : 1;
              candidates.push({
                id: best.id,
                title: best.title || best.name,
                poster: best.poster_path,
                rating: best.vote_average ?? null,
                type: best.media_type === "movie" ? "movie" : best.media_type === "tv" ? "tv" : "movie",
                totalSeasons,
                seasonsWatched: 0,
                status: "not started",
                rawMatch: rawTitle,
              });
            } else {
              candidates.push({
                id: null,
                title: rawTitle,
                poster: null,
                rating: null,
                type: "unknown",
                totalSeasons: 1,
                seasonsWatched: 0,
                status: "not found",
                rawMatch: rawTitle,
              });
            }
          } else {
            candidates.push({
              id: null,
              title: rawTitle,
              poster: null,
              rating: null,
              type: "unknown",
              totalSeasons: 1,
              seasonsWatched: 0,
              status: "not found",
              rawMatch: rawTitle,
            });
          }
        } catch (err) {
          console.error("resolve part error", err);
        }
      }

      setResults(candidates);
      setLoading(false);
      return;
    }

    const scanned = await greedyScanAndResolve(input.trim(), 7); // try up to 7-word candidate chunks
    setResults(scanned);
    setLoading(false);
  };

  const addItem = async (item) => {
    try {
      const docData = {
        tmdbId: item.id || null,
        title: item.title,
        type: item.type === "tv" ? "tv" : item.type === "movie" ? "movie" : "movie",
        category: item.type === "tv" && item.title ? ( /anime/i.test(item.title) ? "anime" : "normal" ) : "normal",
        poster: item.poster,
        rating: item.rating,
        seasonsWatched: item.seasonsWatched || 0,
        totalSeasons: item.totalSeasons || 1,
        status: item.status || "not started",
        lastChecked: Date.now(),
        finishedAt: null,
      };
      await addDoc(collection(db, "watchlist"), docData);
      alert(`Added "${item.title}"`);
    } catch (err) {
      console.error("addItem error", err);
      alert("Failed to add item — see console.");
    }
  };

  const addAll = async () => {
    for (const item of results) {
      await addItem(item);
    }
    alert("All items added!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Bulk And</h2>

      <p>Paste titles(may take a while)</p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste a paragraph or list of titles..."
        rows={8}
        style={{ width: "100%", padding: 10, fontSize: 15 }}
      />

      <div style={{ marginTop: 8 }}>
        <button onClick={handleSearchList} style={{ padding: "8px 12px" }}>Search Titles</button>
        <span style={{ marginLeft: 12 }}>{loading ? "Searching TMDB..." : ""}</span>
      </div>

      <div style={{ marginTop: 20 }}>
        {results.length > 0 && (
          <>
            <h3>Parsed results</h3>
            <button onClick={addAll} style={{ background: "green", color: "white", padding: "6px 10px", borderRadius: 6, marginBottom: 12 }}>
              Add All to Watchlist
            </button>

            {results.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                {item.poster ? (
                  <img src={`https://image.tmdb.org/t/p/w200${item.poster}`} alt={item.title} style={{ width: 80, borderRadius: 6 }} />
                ) : (
                  <div style={{ width: 80, height: 120, background: "#eee", borderRadius: 6, display:"flex", alignItems:"center", justifyContent:"center", color:"#888" }}>
                    no image
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <strong>{item.title}</strong> <br />
                  <small style={{ color: "#666" }}>raw: {item.rawMatch}</small> <br />
                  <span>type: {item.type}</span> • <span>rating: {item.rating ?? "N/A"}</span> • <span>seasons: {item.totalSeasons}</span> <br />
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => addItem(item)} style={{ marginRight: 8 }}>Add</button>
                    {item.status === "not found" && (
                      <button onClick={() => {
                        const newTitle = prompt("Edit title to search:", item.title || item.rawMatch);
                        if (newTitle) {
                          (async () => {
                            const list = await tmdbSearch(newTitle);
                            const best = list?.[0];
                            if (best) {
                              const totalSeasons = best.media_type === "tv" ? await fetchTvSeasonsIfNeeded(best) : 1;
                              const resolved = {
                                id: best.id,
                                title: best.title || best.name,
                                poster: best.poster_path,
                                rating: best.vote_average ?? null,
                                type: best.media_type === "movie" ? "movie" : best.media_type === "tv" ? "tv" : "movie",
                                totalSeasons,
                                seasonsWatched: 0,
                                status: "not started",
                                rawMatch: newTitle,
                              };
                              setResults(prev => prev.map((p, i) => i === idx ? resolved : p));
                            } else {
                              alert("No match found for that edited title.");
                            }
                          })();
                        }
                      }}>Edit & Retry</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
