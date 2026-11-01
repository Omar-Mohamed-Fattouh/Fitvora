import Seo from "../components/Seo";
import { useLanguage } from "../contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  return (
    <article className="prose-page">
      <Seo titleKey="seoAboutTitle" descKey="seoAboutDesc" path="/about" />
      <h1 className="display">{t("aboutTitle")}</h1>
      <p>{t("aboutP1")}</p>
      <p>{t("aboutP2")}</p>
      <p>{t("aboutP3")}</p>
    </article>
  );
};

export default About;
