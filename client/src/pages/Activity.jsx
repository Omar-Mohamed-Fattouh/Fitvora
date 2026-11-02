import { useEffect, useState } from "react";
import Seo from "../components/Seo";
import api from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import PageSkeleton from "../components/PageSkeleton";

const typeKey = {
  cardio: "mixCardio",
  strength: "mixStrength",
  hiit: "mixHiit",
  yoga: "mixYoga",
  other: "mixOther",
  nutrition: "nutrition",
};

const Activity = () => {
  const { t, lang } = useLanguage();
  const [records, setRecords] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/current/summary")
      .then(({ data }) => {
        const list = [...(data.previousRecords || [])].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setRecords(list);
      })
      .catch(() => setError(t("workoutsLoadError")))
      .finally(() => setReady(true));
  }, [t]);

  const locale = lang === "ar" ? "ar" : "en-GB";

  return (
    <div className="dash-page">
      <Seo titleKey="seoActivityTitle" descKey="activitySub" path="/activity" />
      <header className="dash-head">
        <div>
          <h1>{t("pageActivity")}</h1>
          <p>{t("activitySub")}</p>
        </div>
      </header>
      {error && <p className="dash-alert" role="alert">{error}</p>}
      {!ready ? (
        <PageSkeleton variant="table" />
      ) : records.length === 0 ? (
        <p className="dash-muted">{t("emptyHistory")}</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("date")}</th>
                <th>{t("sessionType")}</th>
                <th>{t("duration")}</th>
                <th>{t("volume")}</th>
                <th>{t("sets")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={`${record.date}-${index}`}>
                  <td>{new Date(record.date).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td>{t(typeKey[record.type] || "mixOther")}</td>
                  <td className="tabular">{record.duration} {t("min")}</td>
                  <td className="tabular">{record.volume} {t("kcal")}</td>
                  <td className="tabular">{record.sets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Activity;
