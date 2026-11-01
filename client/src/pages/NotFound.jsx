import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { useLanguage } from "../contexts/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <div className="public-shell">
      <Seo titleKey="pageNotFound" descKey="pageNotFoundText" path="/404" />
      <main id="main-content" className="public-main">
        <article className="prose-page">
          <p className="kicker">404</p>
          <h1 className="display">{t("pageNotFound")}</h1>
          <p>{t("pageNotFoundText")}</p>
          <div className="welcome-cta">
            <Link to="/" className="ink-btn">{t("goHome")}</Link>
            <button type="button" className="text-link" onClick={() => window.history.back()}>{t("goBack")}</button>
          </div>
        </article>
      </main>
    </div>
  );
};

export default NotFound;
