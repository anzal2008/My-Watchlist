import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth(); // <-- match the case from AuthContext
  return isLoggedIn ? children : <Navigate to="/login" />;
}
