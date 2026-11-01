import { Outlet, Navigate, Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

const AuthLayout = () => {
  const { isAuthenticated, loading } = useUser();
  const { t } = useLanguage();

  if (isAuthenticated && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="public-shell">
      <header className="public-bar">
        <div className="public-bar-inner">
          <Link to="/" className="wordmark" aria-label="Fitvora">Fitvora</Link>
          <div className="public-actions">
            <LanguageToggle />
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="public-main auth-main">
        <Outlet />
      </main>
      <footer className="public-foot">
        <p>{t("footerStudio")}</p>
        <div className="public-foot-links">
          <Link to="/privacy">{t("privacy")}</Link>
          <Link to="/terms">{t("terms")}</Link>
          <span>{t("rights", { year: new Date().getFullYear() })}</span>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
