import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useUser();
  const { t } = useLanguage();

  if (loading) {
    return <div className="dash-loading">{t("loading")}</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
