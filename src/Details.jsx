import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";

export default function Details() {
  const { id, type } = useParams();
  const { theme } = useContext(ThemeContext);
  const [item, setItem] = useState(null);

  const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}`
      );

      if (res.ok) {
        setItem(await res.json());
      }
    };

    fetchDetails();
  }, [id, type]);


  if (!item) return <div style={{ padding: 40 }}>Loading…</div>;

  const isAnime =
    item.genres?.some((g) => g.name === "Animation") &&
    (item.original_language === "ja" ||
      item.origin_country?.includes("JP"));

  const bg =
    theme === "dark"
      ? "oklch(14% 0.01 250)"
      : "oklch(98% 0.01 250)";

  const cardBg =
    theme === "dark"
      ? "oklch(18% 0.02 250)"
      : "white";

  const border =
    theme === "dark"
      ? "1px solid oklch(25% 0.02 250)"
      : "1px solid #e5e7eb";

  const textMuted =
    theme === "dark"
      ? "rgba(255,255,255,0.7)"
      : "#555";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: theme === "dark" ? "white" : "black",
        padding: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 32,
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        {item.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w400${item.poster_path}`}
            alt={item.title || item.name}
            style={{
              width: 280,
              borderRadius: 20,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          />
        )}

        <div
          style={{
            flex: 1,
            background: cardBg,
            border,
            borderRadius: 20,
            padding: 28,
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            {item.title || item.name}
          </h1>

          <div style={{ color: textMuted, marginBottom: 16 }}>
            ⭐ {item.vote_average?.toFixed(1)} •{" "}
            {isAnime ? "Anime" : item.title ? "Movie" : "TV Show"}
          </div>

          <div
            style={{
              background:
                theme === "dark"
                  ? "oklch(16% 0.02 250)"
                  : "#f9fafb",
              border,
              borderRadius: 14,
              padding: 16,
              lineHeight: 1.6,
            }}
          >
            {item.overview || "No description available."}
          </div>

          <div style={{ marginTop: 24 }}>
            <a
              href={
                isAnime
                  ? "https://hianime.to/"
                  : "https://www.cineby.gd/"
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "14px 18px",
                background:
                  "linear-gradient(135deg, oklch(60% 0.18 260), oklch(50% 0.2 260))",
                color: "white",
                borderRadius: 14,
                textDecoration: "none",
                fontWeight: 600,
                textAlign: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              }}
            >
              Watch on {isAnime ? "HiAnime" : "Cineby"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
