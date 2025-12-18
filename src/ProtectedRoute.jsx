import { Navigate } from "react-router-dom";
import { useAuth } from "./Authcontext";

export default function ProtectedRoute({children}) {
    const {isLoggedin} = useAuth();
    return isLoggedIn ? children : <Navigate to="/login" />;
}