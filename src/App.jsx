import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Search from "./Search";
import Watchlist from "./Watchlist";
import Watched from "./Watched";
import BulkAdd from "./BulkAdd";
import NavBar from "./Navbar";
import { ThemeProvider } from "./ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <NavBar />

        <Routes>
          {/* Default → Watchlist */}
          <Route path="/" element={<Navigate to="/watchlist" />} />

          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/watched" element={<Watched />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bulk-add" element={<BulkAdd />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
