import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Search from "./Search";
import Watchlist from "./Watchlist";
import Watched from "./Watched";
import BulkAdd from "./BulkAdd";

export default function App() {
  return (
    <BrowserRouter>
      <nav
        style={{
          padding: "10px",
          background: "#222",
          color: "#fff",
          display: "flex",
          gap: "20px",
        }}
      >
        <Link to="/bulk-add" style={{ marginRight: 15 }}>
          Bulk Add
        </Link>
        <Link to="/" style={{ marginRight: 15 }}>
          Search
        </Link>
        <Link to="/watchlist" style={{ marginRight: 15 }}>
          Watchlist
        </Link>
        <Link to="/watched">Watched</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/watched" element={<Watched />} />
        <Route path="/bulk-add" element={<BulkAdd />} />
      </Routes>
    </BrowserRouter>
  );
}

// ideas
// improve layout
// add options ot sort
// search will autocomplete
// maybe accounts
// Put in alot of info it will spit out everything