import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Details() {
  const { id, type } = useParams();
  const { theme } = useContext(ThemeContext);

  const [item, setItem] = useState(null);
  const [myRating, setMyRating] = useState(0);

  const apiKey = "3f3a43be23e6ffc9e3acb7fd43f7eea7";
  const isMobile = window.innerWidth <= 640;

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}`
      );
      if (res.ok) setItem(await res.json());
    };
    fetchDetails();
  }, [id, type]);

  useEffect(() => {
    const loadRating = async () => {
      const snap = await getDoc(doc(db, "userRatings", `${type}_${id}`));
      if (snap.exists()) setMyRating(snap.data().rating);
    };
    loadRating();
  }, [id, type]);

  const saveRating = async (rating) => {
    setMyRating(rating);
    await setDoc(doc(db, "userRatings", `${type}_${id}`), {
      rating,
      updatedAt: Date.now(),
    });
  };

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

  const muted =
    theme === "dark"
      ? "rgba(255,255,255,0.7)"
      : "#555";

  const pill = {
    padding: "6px 12px",
    borderRadius: 999,
    background:
      theme === "dark"
        ? "oklch(22% 0.02 250)"
        : "#f1f5f9",
    fontSize: 13,
    fontWeight: 500,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        padding: isMobile ? 16 : 40,
        color: theme === "dark" ? "white" : "black",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 28,
        }}
      >
        {item.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w400${item.poster_path}`}
            alt={item.title || item.name}
            style={{
              width: isMobile ? "70%" : 280,
              alignSelf: isMobile ? "center" : "flex-start",
              borderRadius: 20,
              boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
            }}
          />
        )}

        <div
          style={{
            flex: 1,
            background: cardBg,
            border,
            borderRadius: 20,
            padding: isMobile ? 20 : 28,
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            {item.title || item.name}
          </h1>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 14,
              color: muted,
            }}
          >
            <span style={pill}>
              ⭐ {item.vote_average?.toFixed(1)}
            </span>

            <span style={pill}>
              {isAnime ? "Anime" : item.title ? "Movie" : "TV"}
            </span>

            {item.number_of_seasons && (
              <span style={pill}>
                📺 {item.number_of_seasons} Seasons
              </span>
            )}

            {item.number_of_episodes && (
              <span style={pill}>
                🎞️ {item.number_of_episodes} Episodes
              </span>
            )}

            {item.runtime && (
              <span style={pill}>
                ⏱ {item.runtime} min
              </span>
            )}
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
              marginBottom: 20,
            }}
          >
            {item.overview || "No description available."}
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 6, fontWeight: 600 }}>
              Your Rating {myRating > 0 && `• ${myRating * 2}/10`}
            </div>

            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  style={{
                    position: "relative",
                    fontSize: 30,
                    cursor: "pointer",
                    color: muted,
                  }}
                >
                  ★
                  {myRating >= star - 0.5 && (
                    <span
                      onClick={() => saveRating(star - 0.5)}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        width: "50%",
                        overflow: "hidden",
                        color: "#facc15",
                      }}
                    >
                      ★
                    </span>
                  )}

                  {myRating >= star && (
                    <span
                      onClick={() => saveRating(star)}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        color: "#facc15",
                      }}
                    >
                      ★
                    </span>
                  )}

                  <span
                    onClick={() => saveRating(star - 0.5)}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "50%",
                      height: "100%",
                    }}
                  />
                  <span
                    onClick={() => saveRating(star)}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      width: "50%",
                      height: "100%",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

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
  );
}
