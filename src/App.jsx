import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Search from "./Search";
import Watchlist from "./Watchlist";
import Watched from "./Watched";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20 }}>
        {/* Navigation */}
        <nav style={{ marginBottom: 20 }}>
          <Link to="/" style={{ marginRight: 15 }}>Search</Link>
          <Link to="/watchlist" style={{ marginRight: 15 }}>Watchlist</Link>
          <Link to="/watched">Watched</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/watched" element={<Watched />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
