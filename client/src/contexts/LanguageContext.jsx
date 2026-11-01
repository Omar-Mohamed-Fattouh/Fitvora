import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem("fitvora-lang") || "en");

  const setLang = (next) => {
    setLangState(next);
    localStorage.setItem("fitvora-lang", next);
  };

  useEffect(() => {
    document.documentElement.lang = lang === "ar" ? "ar" : "en";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    const skip = document.querySelector(".skip-link");
    const table = translations[lang] || translations.en;
    if (skip) skip.textContent = table.skip;
  }, [lang]);

  const t = useMemo(() => {
    return (key, vars = {}) => {
      const table = translations[lang] || translations.en;
      let value = table[key] ?? translations.en[key] ?? key;
      Object.entries(vars).forEach(([name, item]) => {
        value = value.replaceAll(`{${name}}`, String(item ?? ""));
      });
      return value;
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};
