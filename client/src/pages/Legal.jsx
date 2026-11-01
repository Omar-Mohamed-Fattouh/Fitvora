import { Link, useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import { useLanguage } from "../contexts/LanguageContext";

const Legal = () => {
  const isPrivacy = useLocation().pathname === "/privacy";
  const { t } = useLanguage();

  return (
    <article className="prose-page">
      <Seo titleKey="seoLegalTitle" descKey={isPrivacy ? "legalPrivacyP1" : "legalTermsP1"} path={isPrivacy ? "/privacy" : "/terms"} />
      <h1 className="display">{isPrivacy ? t("privacy") : t("terms")}</h1>
      <p>{isPrivacy ? t("legalPrivacyP1") : t("legalTermsP1")}</p>
      <p>{isPrivacy ? t("legalPrivacyP2") : t("legalTermsP2")}</p>
      <Link to="/" className="text-link">{t("backToFitvora")}</Link>
    </article>
  );
};

export default Legal;
