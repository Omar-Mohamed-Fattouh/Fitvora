import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useUser();
  const hasToken = Boolean(localStorage.getItem("authToken"));

  if (!hasToken && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
