import { useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const Seo = ({ titleKey, descKey, path = "/" }) => {
  const { t, lang } = useLanguage();
  const title = t(titleKey);
  const description = descKey ? t(descKey) : t("seoHomeDesc");

  useEffect(() => {
    document.title = title;
    const setMeta = (selector, attr, value) => {
      const node = document.querySelector(selector);
      if (node) node.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:locale"]', "content", lang === "ar" ? "ar_EG" : "en_US");
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `${window.location.origin}${path}`);
  }, [title, description, lang, path]);

  return null;
};

export default Seo;
