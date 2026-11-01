import { Link, NavLink, Outlet } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import LanguageToggle from "../components/LanguageToggle";

const PublicLayout = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useUser();

  const links = [
    { to: "/about", label: t("navAbout") },
    { to: "/guides", label: t("navGuides") },
    { to: "/contact", label: t("navContact") },
  ];

  return (
    <div className="public-shell">
      <header className="public-bar">
        <div className="public-bar-inner">
          <Link to="/" className="wordmark" aria-label="Fitvora">
            Fitvora
          </Link>
          <nav className="public-nav" aria-label={t("navHome")}>
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="public-actions">
            <LanguageToggle compact />
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-link">{t("openApp")}</Link>
            ) : (
              <>
                <Link to="/login" className="text-link">{t("signInCta")}</Link>
                <Link to="/signup" className="ink-btn">{t("getStarted")}</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="public-main">
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

export default PublicLayout;
