import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Search from "./Search";
import Watchlist from "./Watchlist";
import Watched from "./Watched";
import BulkAdd from "./BulkAdd";
import { ThemeProvider, ThemeContext } from "./ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({ theme }) => (
          <BrowserRouter>
            <nav
              style={{
                padding: "10px",
                background: theme === "dark" ? "#222" : "#eee",
                color: theme === "dark" ? "#fff" : "#000",
                display: "flex",
                gap: "20px",
              }}
            >
              <Link style={{ color: theme === "dark" ? "#fff" : "#000" }} to="/bulk-add">
                Bulk Add
              </Link>
              <Link style={{ color: theme === "dark" ? "#fff" : "#000" }} to="/">
                Search
              </Link>
              <Link style={{ color: theme === "dark" ? "#fff" : "#000" }} to="/watchlist">
                Watchlist
              </Link>
              <Link style={{ color: theme === "dark" ? "#fff" : "#000" }} to="/watched">
                Watched
              </Link>
            </nav>

            <Routes>
              <Route path="/" element={<Search />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/watched" element={<Watched />} />
              <Route path="/bulk-add" element={<BulkAdd />} />
            </Routes>
          </BrowserRouter>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}
