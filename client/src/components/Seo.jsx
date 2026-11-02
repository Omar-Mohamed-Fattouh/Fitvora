import { useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const Seo = ({ titleKey, descKey, path = "/" }) => {
  const { t, lang } = useLanguage();
  const title = t(titleKey);
  const description = descKey ? t(descKey) : t("seoHomeDesc");

  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}${path}`;
    const image = `${origin}/share.jpg`;
    document.title = title;
    const setMeta = (selector, attr, value) => {
      const node = document.querySelector(selector);
      if (node) node.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:locale"]', "content", lang === "ar" ? "ar_EG" : "en_US");
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:image"]', "content", image);
    setMeta('meta[property="og:image:secure_url"]', "content", image);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", image);
    setMeta('meta[itemprop="image"]', "content", image);
    const imageSrc = document.querySelector('link[rel="image_src"]');
    if (imageSrc) imageSrc.setAttribute("href", image);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
  }, [title, description, lang, path]);

  return null;
};

export default Seo;
