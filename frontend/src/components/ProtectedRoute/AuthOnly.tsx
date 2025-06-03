import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthOnly() {
  const { user, isLoading } = useAuth();
  // If user is not authenticated, redirect
  if (!user && !isLoading) {
    return <Navigate to={"/"} replace />;
  }
  // Otherwise, render the child routes
  return <Outlet />;
}
