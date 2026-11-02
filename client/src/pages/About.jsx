import Seo from "../components/Seo";
import { useLanguage } from "../contexts/LanguageContext";

const FOLDS = [
  ["aboutSection1Title", "aboutSection1Text"],
  ["aboutSection2Title", "aboutSection2Text"],
  ["aboutSection3Title", "aboutSection3Text"],
  ["aboutNoteTitle", "aboutNoteText"],
];

const About = () => {
  const { t } = useLanguage();

  return (
    <article className="about-page">
      <Seo titleKey="seoAboutTitle" descKey="seoAboutDesc" path="/about" />
      <p className="kicker">{t("aboutKicker")}</p>
      <h1 className="display">{t("aboutTitle")}</h1>
      <p className="lead">{t("aboutLead")}</p>
      <div className="fold-list">
        {FOLDS.map(([title, body], index) => (
          <details key={title} className="fold" open={index === 0}>
            <summary>{t(title)}</summary>
            <p>{t(body)}</p>
          </details>
        ))}
      </div>
    </article>
  );
};

export default About;
