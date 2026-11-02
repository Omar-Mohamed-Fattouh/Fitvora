import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import Seo from "../components/Seo";

const STATS = [
  ["welcomeStat1Value", "welcomeStat1Label"],
  ["welcomeStat2Value", "welcomeStat2Label"],
  ["welcomeStat3Value", "welcomeStat3Label"],
];

const FEATURES = [1, 2, 3];
const STEPS = [1, 2, 3];

const Welcome = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useUser();

  const primary = isAuthenticated ? (
    <Link to="/dashboard" className="ink-btn">{t("openApp")}</Link>
  ) : (
    <Link to="/signup" className="ink-btn">{t("getStarted")}</Link>
  );

  return (
    <article className="welcome">
      <Seo titleKey="seoHomeTitle" descKey="seoHomeDesc" path="/" />

      <section className="hero">
        <div>
          <p className="kicker">{t("welcomeKicker")}</p>
          <h1 className="display">{t("welcomeTitle")}</h1>
          <p className="lead">{t("welcomeLead")}</p>
          <p className="note">{t("welcomeNote")}</p>
          <div className="welcome-cta">
            {primary}
            {!isAuthenticated && <Link to="/login" className="text-link">{t("signInCta")}</Link>}
          </div>
        </div>

        <aside className="hero-panel" aria-hidden="true">
          <div className="hero-panel-head">
            <span>{t("heroPanelLabel")}</span>
            <span>{t("heroPanelSample")}</span>
          </div>
          <dl className="hero-kpis">
            <div>
              <dt>{t("heroPanelSessions")}</dt>
              <dd>4</dd>
            </div>
            <div>
              <dt>{t("heroPanelMinutes")}</dt>
              <dd>148</dd>
            </div>
            <div>
              <dt>{t("heroPanelCalories")}</dt>
              <dd>1,920</dd>
            </div>
            <div>
              <dt>{t("heroPanelProtein")}</dt>
              <dd>126g</dd>
            </div>
          </dl>
          <div className="hero-bars" aria-hidden="true">
            <span /><span /><span /><span /><span /><span /><span />
          </div>
          <p className="hero-panel-hint">{t("heroPanelHint")}</p>
        </aside>
      </section>

      <dl className="stat-row">
        {STATS.map(([value, label]) => (
          <div key={value}>
            <dt className="display">{t(value)}</dt>
            <dd>{t(label)}</dd>
          </div>
        ))}
      </dl>

      <section className="welcome-section" aria-labelledby="welcome-features">
        <header>
          <p className="kicker">{t("welcomeFeaturesKicker")}</p>
          <h2 id="welcome-features">{t("welcomeFeaturesTitle")}</h2>
        </header>
        <div className="feature-grid">
          {FEATURES.map((index) => (
            <article key={index}>
              <p className="feature-index">{String(index).padStart(2, "0")}</p>
              <h3>{t(`welcomeFeature${index}Title`)}</h3>
              <p>{t(`welcomeFeature${index}Text`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="welcome-section method" aria-labelledby="welcome-method">
        <header>
          <p className="kicker">{t("methodKicker")}</p>
          <h2 id="welcome-method">{t("methodTitle")}</h2>
        </header>
        <ol>
          {STEPS.map((index) => (
            <li key={index}>
              <span className="step-n" aria-hidden="true">{index}</span>
              <h3>{t(`method${index}Title`)}</h3>
              <p>{t(`method${index}Text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-band">
        <div>
          <h2>{t("welcomeCtaTitle")}</h2>
          <p>{t("welcomeCtaText")}</p>
        </div>
        {primary}
      </section>
    </article>
  );
};

export default Welcome;
