import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { useLanguage } from "../contexts/LanguageContext";

const slugs = ["protein", "rest", "walk"];

const Guides = () => {
  const { t } = useLanguage();
  const { slug } = useParams();
  const guide = useMemo(() => {
    const index = slugs.indexOf(slug);
    if (index === -1) return null;
    const n = index + 1;
    return { n, title: t(`guide${n}Title`), body: t(`guide${n}Body`) };
  }, [slug, t]);

  if (guide) {
    return (
      <article className="prose-page">
        <Seo titleKey={`guide${guide.n}Title`} descKey={`guide${guide.n}Excerpt`} path={`/guides/${slug}`} />
        <p className="kicker"><Link to="/guides">{t("guidesTitle")}</Link></p>
        <h1 className="display">{guide.title}</h1>
        <p>{guide.body}</p>
      </article>
    );
  }

  return (
    <article className="prose-page">
      <Seo titleKey="seoGuidesTitle" descKey="seoGuidesDesc" path="/guides" />
      <h1 className="display">{t("guidesTitle")}</h1>
      <p className="lead">{t("guidesSub")}</p>
      <ol className="guide-list">
        {slugs.map((item, index) => (
          <li key={item}>
            <Link to={`/guides/${item}`}>
              <h2>{t(`guide${index + 1}Title`)}</h2>
              <p>{t(`guide${index + 1}Excerpt`)}</p>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
};

export default Guides;
