import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";

import NavBar from "./Navbar";
import Watchlist from "./Watchlist";
import Watched from "./Watched";
import Search from "./Search";
import BulkAdd from "./BulkAdd";

export default function App() {
  return (
    <ThemeProvider>
      <NavBar />

      <Routes>
        <Route path="/" element={<Navigate to="/watchlist" />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/watched" element={<Watched />} />
        <Route path="/search" element={<Search />} />
        <Route path="/bulk-add" element={<BulkAdd />} />
      </Routes>
    </ThemeProvider>
  );
}
