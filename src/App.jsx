import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Search from "./Search";
import Watchlist from "./Watchlist";
import Watched from "./Watched";
import BulkAdd from "./BulkAdd";
import NavBar from "./Navbar";
import { ThemeProvider } from "./ThemeContext";
import {useAuth} from "./Authcontext";
import ProtectedRoute from "./Protectedroute";
import Login from "./login";
import Signup from "./Signup"

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <NavBar />

        <Routes>
          <Route path="login" element={<login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            Path="/"
            element={
              <ProtectedRoute>
                <Navigate to= "/watchlist" />
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
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
