import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import Seo from "../components/Seo";

const Welcome = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useUser();

  return (
    <article className="welcome">
      <Seo titleKey="seoHomeTitle" descKey="seoHomeDesc" path="/" />
      <p className="kicker">{t("welcomeKicker")}</p>
      <h1 className="display">{t("welcomeTitle")}</h1>
      <p className="lead">{t("welcomeLead")}</p>
      <p className="note">{t("welcomeNote")}</p>
      <div className="welcome-cta">
        {isAuthenticated ? (
          <Link to="/dashboard" className="ink-btn">{t("openApp")}</Link>
        ) : (
          <>
            <Link to="/signup" className="ink-btn">{t("getStarted")}</Link>
            <Link to="/login" className="text-link">{t("signInCta")}</Link>
          </>
        )}
      </div>

      <dl className="stat-row">
        {[
          ["welcomeStat1Value", "welcomeStat1Label"],
          ["welcomeStat2Value", "welcomeStat2Label"],
          ["welcomeStat3Value", "welcomeStat3Label"],
        ].map(([value, label]) => (
          <div key={value}>
            <dt className="display">{t(value)}</dt>
            <dd>{t(label)}</dd>
          </div>
        ))}
      </dl>

      <section className="method">
        <h2>{t("methodTitle")}</h2>
        <ol>
          {[1, 2, 3].map((index) => (
            <li key={index}>
              <h3>{t(`method${index}Title`)}</h3>
              <p>{t(`method${index}Text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rules">
        <h2>{t("ruleTitle")}</h2>
        <ul>
          <li>{t("rule1")}</li>
          <li>{t("rule2")}</li>
          <li>{t("rule3")}</li>
        </ul>
      </section>

      <p className="closing">{t("closingLine")}</p>
    </article>
  );
};

export default Welcome;
