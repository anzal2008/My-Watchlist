// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Search from "./Search";
import Watchlist from "./Watchlist";
import Watched from "./Watched";
import BulkAdd from "./BulkAdd";
import NavBar from "./Navbar";

import { ThemeProvider } from "./ThemeContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import Signup from "./Signup";

export default function App() {
  return (
    <ThemeProvider>
      <NavBar />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/watchlist" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watched"
          element={
            <ProtectedRoute>
              <Watched />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulk-add"
          element={
            <ProtectedRoute>
              <BulkAdd />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}
