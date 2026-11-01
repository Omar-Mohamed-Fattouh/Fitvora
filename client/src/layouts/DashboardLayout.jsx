import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Apple, ClipboardList, Dumbbell, Heart, Home, LogOut, Menu, Settings, X } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { t } = useLanguage();

  const sections = [
    {
      title: t("navSectionTrain"),
      items: [
        { path: "/dashboard", label: t("navDashboard"), icon: Home },
        { path: "/activity", label: t("navActivity"), icon: ClipboardList },
        { path: "/workouts", label: t("navWorkouts"), icon: Dumbbell },
        { path: "/nutrition", label: t("navNutrition"), icon: Apple },
      ],
    },
    {
      title: t("navSectionAccount"),
      items: [
        { path: "/health-info", label: t("navHealth"), icon: Heart },
        { path: "/settings", label: t("navSettings"), icon: Settings },
      ],
    },
  ];

  return (
    <div className="desk-shell">
      {sidebarOpen && <div className="desk-scrim lg-hide" onClick={() => setSidebarOpen(false)} />}
      <aside className={`desk-side ${sidebarOpen ? "open" : ""}`}>
        <div className="desk-brand">
          <Link to="/dashboard" className="wordmark sm">Fitvora</Link>
          <button type="button" className="icon-btn lg-hide" onClick={() => setSidebarOpen(false)} aria-label={t("closeSidebar")}>
            <X size={18} />
          </button>
        </div>
        <div className="desk-user">
          <span aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
          <div>
            <p>{user?.name || "—"}</p>
            <small>{user?.email || ""}</small>
          </div>
        </div>
        <nav aria-label={t("navDashboard")}>
          {sections.map((section) => (
            <div key={section.title} className="nav-block">
              <p>{section.title}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const current = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={current ? "page" : undefined}
                    className={current ? "is-current" : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="desk-side-foot">
          <LanguageToggle />
          <button type="button" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut size={16} aria-hidden="true" />
            {t("logOut")}
          </button>
        </div>
      </aside>
      <div className="desk-main">
        <header className="desk-top">
          <button type="button" className="icon-btn lg-hide" onClick={() => setSidebarOpen(true)} aria-label={t("openSidebar")}>
            <Menu size={18} />
          </button>
          <p className="desk-tag">{t("brandTag")}</p>
          <LanguageToggle compact />
        </header>
        <main id="main-content" tabIndex={-1} className="desk-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
