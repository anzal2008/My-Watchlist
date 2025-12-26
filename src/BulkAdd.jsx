import React, { useContext, useState } from "react";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const palette = (theme) => ({
  bg: theme === "dark" ? "oklch(0.14 0.025 264)" : "oklch(0.97 0.005 264)",
  surface: theme === "dark" ? "oklch(0.2 0.02 264)" : "oklch(1 0 0)",
  border: theme === "dark" ? "oklch(0.28 0.03 264)" : "oklch(0.85 0.02 264)",
  text: theme === "dark" ? "oklch(0.96 0.04 264)" : "oklch(0.15 0.05 264)",
  muted: theme === "dark" ? "oklch(0.7 0.03 264)" : "oklch(0.45 0.03 264)",
  primary: "oklch(0.65 0.16 260)",
  success: "oklch(0.7 0.07 160)",
});

export default function BulkAdd() {
  const { theme } = useContext(ThemeContext);
  const colors = palette(theme);

  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [progress,setProgress] = useState(0);
  const navigate = useNavigate();

  const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";

  const normalize = (s = "") =>
    s
      .toLowerCase()
      .replace(/[\u2018\u2019\u201C\u201D"“”']/g, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  function levenshtein(a = "", b = "") {
    const A = normalize(a);
    const B = normalize(b);
    if (A === B) return 0;

    const dp = Array.from({ length: A.length + 1 }, () =>
      new Array(B.length + 1).fill(0)
    );

    for (let i = 0; i <= A.length; i++) dp[i][0] = i;
    for (let j = 0; j <= B.length; j++) dp[0][j] = j;

    for (let i = 1; i <= A.length; i++) {
      for (let j = 1; j <= B.length; j++) {
        const cost = A[i - 1] === B[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[A.length][B.length];
  }

  const distanceRatio = (a, b) =>
    levenshtein(a, b) / Math.max(normalize(a).length, normalize(b).length, 1);

  async function tmdbSearch(query) {
    const q = encodeURIComponent(query);
    const urls = [
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${q}`,
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${q}`,
      `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${q}`,
    ];

    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.results?.length) return data.results;
    }
    return [];
  }

  async function fetchTvSeasonsIfNeeded(item) {
    if (item?.media_type !== "tv") return 1;
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}`
      );
      const data = await res.json();
      return data?.number_of_seasons || 1;
    } catch {
      return 1;
    }
  }

  async function greedyScanAndResolve(text, maxWords = 7) {
    const tokens = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
    const total = tokens.length;
    const found = [];
    let i = 0;

    while (i < tokens.length) {
      let matched = null;
      let spanUsed = 0;

      for (let span = Math.min(maxWords, tokens.length - i); span >= 1; span--) {
        const candidate = tokens.slice(i, i + span).join(" ");
        const results = await tmdbSearch(candidate);
        if (!results.length) continue;

        let best = null;
        let bestScore = Infinity;

        for (const r of results.slice(0, 8)) {
          const title = r.title || r.name || "";
          const score = distanceRatio(candidate, title);
          if (score < bestScore) {
            bestScore = score;
            best = r;
          }
        }

        if (best && bestScore <= 0.45) {
          matched = best;
          spanUsed = span;
          break;
        }
      }

      if (matched) {
      const isAnime = matched_type === "tv" &&
      matched.genre_ids?.includes(16);
        found.push({
          id: matched.id,
          title: matched.title || matched.name,
          poster: matched.poster_path,
          rating: matched.vote_average ?? null,

          type: matched.media_type === "tv" ? "tv" : "movie",
          isAnime,
          totalSeasons:
            matched.media_type === "tv"
              ? await fetchTvSeasonsIfNeeded(matched)
              : 1,
          rawMatch: tokens.slice(i, i + spanUsed).join(" "),
          status: "not started",
        });
        i += spanUsed;
        if(i % 2 === 0) setProgress(Math.round((i/total)*100));
      } else {
        found.push({
          id: null,
          title: tokens[i],
          poster: null,
          rating: null,
          type: "unknown",
          totalSeasons: 1,
          rawMatch: tokens[i],
          status: "not found",
        });
        i += 1;
        if(i % 2 === 0) setProgress(Math.round((i/total)*100));

      }
    }

    return found;
  }

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setProgress(0);
    setResults([]);
    
    const resolved = await greedyScanAndResolve(input);
    setResults(resolved);
    setLoading(false);
    setProgress(100);
  };

  const addItem = async (item) => {
    await addDoc(collection(db, "watchlist"), {
      tmdbId: item.id,
      title: item.title,
      type: item.type,
      isAnime: item.isAnime ?? false,
      poster: item.poster,
      rating: item.rating,
      totalSeasons: item.totalSeasons,
      seasonsWatched: 0,
      status: item.status,
      createdAt: Date.now(),
    });
  };

  const addAll = async () => {
    for (const item of results) {
      if (item.id) await addItem(item);
    }
    setToast("All items added successfully!");
    setTimeout(() => setToast(null), 2500);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      padding: 20,
      background: colors.bg,
      color: colors.text,
    },
    textarea: {
      width: "100%",
      minHeight: 140,
      padding: 12,
      borderRadius: 10,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      color: colors.text,
    },
    card: {
      display: "flex",
      gap: 14,
      padding: 14,
      background: colors.surface,
      borderRadius: 14,
      border: `1px solid ${colors.border}`,
      boxShadow: "0 12px 30px oklch(0% 0 0 / 0.25)",
      marginBottom: 14,
    },
    button: {
      padding: "8px 14px",
      borderRadius: 10,
      border: "none",
      background: colors.primary,
      color: "white",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <h2>Bulk Add</h2>

      <textarea
        style={styles.textarea}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste one line or a paragraph of titles..."
      />

      <div style={{ marginTop: 12 }}>
        <button style={styles.button} onClick={handleSearch}>
          {loading ? "Searching..." : "Search Titles"}
        </button>

        {results.length > 0 && (
          <button
            style={{
              ...styles.button,
              marginLeft: 10,
              background: colors.success,
            }}
            onClick={addAll}
          >
            Add All
          </button>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        {results.map((item, i) => (
          <div key={i} style={styles.card}>
            {item.poster ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${item.poster}`}
                alt=""
                style={{ width: 80, borderRadius: 10 }}
                onClick={() => navigate(`/details/${item.id}`)}
              />
            ) : (
              <div
                style={{
                  width: 80,
                  height: 120,
                  background: colors.border,
                  borderRadius: 10,
                }}
              />
            )}

            <div style={{ flex: 1 }}>
              <strong>{item.title}</strong>
              <div style={{ color: colors.muted, fontSize: 13 }}>
                raw: {item.rawMatch}
              </div>
              <div>
                {item.isAnime ? "anime" : item.type} • ⭐ {item.rating ?? "N/A"} • seasons{" "}
                {item.totalSeasons}
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && (
        <div
          style={{
            margingTop: 16,
            height: 10,
            width: "100%",
            background: colors.border,
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "oklch(0.45 0.12 255)",
              transition: "width 0.25s ease"
            }}
          />
        </div>
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "oklch(0.7 0.05 260)",
            color: "white",
            padding: "12px 18px",
            borderRadius: 14,
            boxShadow: "0 20px 40px oklch(0% 0 0 / 0.4)",
            fontWeight: 500,
            zIndex: 9999,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
