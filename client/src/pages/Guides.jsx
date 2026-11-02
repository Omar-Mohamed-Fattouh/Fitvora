import { useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { useLanguage } from "../contexts/LanguageContext";

const GUIDES = [
  { n: 1, slug: "protein" },
  { n: 2, slug: "rest" },
  { n: 3, slug: "walk" },
];

const Guides = () => {
  const { t } = useLanguage();
  const { slug } = useParams();

  return (
    <article className="guides-page">
      <Seo titleKey="seoGuidesTitle" descKey="seoGuidesDesc" path="/guides" />
      <p className="kicker">{t("guidesKicker")}</p>
      <h1 className="display">{t("guidesTitle")}</h1>
      <p className="lead">{t("guidesSub")}</p>
      <div className="fold-list">
        {GUIDES.map((guide, index) => (
          <details key={guide.slug} className="fold" open={slug ? slug === guide.slug : index === 0} id={guide.slug}>
            <summary>
              <span>
                <small className="kicker">{t(`guide${guide.n}Category`)}</small>
                {t(`guide${guide.n}Title`)}
              </span>
            </summary>
            {t(`guide${guide.n}Body`).split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </details>
        ))}
      </div>
    </article>
  );
};

export default Guides;
