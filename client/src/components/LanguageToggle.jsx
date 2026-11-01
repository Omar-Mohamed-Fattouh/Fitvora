import { useLanguage } from "../contexts/LanguageContext";

const LanguageToggle = () => {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="lang-toggle" role="group" aria-label={t("language")}>
      <button type="button" onClick={() => setLang("en")} className={lang === "en" ? "is-on" : undefined} aria-pressed={lang === "en"}>
        EN
      </button>
      <button type="button" onClick={() => setLang("ar")} className={lang === "ar" ? "is-on" : undefined} aria-pressed={lang === "ar"}>
        ع
      </button>
    </div>
  );
};

export default LanguageToggle;
