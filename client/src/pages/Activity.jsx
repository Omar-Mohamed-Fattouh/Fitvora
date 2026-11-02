import { useEffect, useMemo, useState } from "react";
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

const FILTERS = ["all", "strength", "cardio", "hiit", "yoga"];

const Activity = () => {
  const { t, lang } = useLanguage();
  const [records, setRecords] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

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
  const visible = records.filter((record) => filter === "all" || record.type === filter);
  const totals = useMemo(() => ({
    sessions: visible.length,
    minutes: visible.reduce((sum, record) => sum + (record.duration || 0), 0),
    calories: visible.reduce((sum, record) => sum + (record.volume || 0), 0),
    sets: visible.reduce((sum, record) => sum + (record.sets || 0), 0),
  }), [visible]);

  const groups = useMemo(() => {
    const map = new Map();
    visible.forEach((record) => {
      const stamp = new Date(record.date);
      const key = Number.isNaN(stamp.getTime())
        ? t("unknown")
        : stamp.toLocaleDateString(locale, { month: "long", year: "numeric" });
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(record);
    });
    return [...map.entries()];
  }, [visible, locale, t]);

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
        <section className="dash-card pad">
          <h3>{t("emptyHistory")}</h3>
          <p className="dash-muted">{t("emptyHistoryHint")}</p>
        </section>
      ) : (
        <>
          <div className="kpi-row">
            <article className="dash-card kpi">
              <p>{t("sessionsLogged")}</p>
              <strong className="tabular">{totals.sessions}</strong>
            </article>
            <article className="dash-card kpi">
              <p>{t("duration")}</p>
              <strong className="tabular">{totals.minutes} <span>{t("min")}</span></strong>
            </article>
            <article className="dash-card kpi">
              <p>{t("volume")}</p>
              <strong className="tabular">{totals.calories} <span>{t("kcal")}</span></strong>
            </article>
            <article className="dash-card kpi">
              <p>{t("sets")}</p>
              <strong className="tabular">{totals.sets}</strong>
            </article>
          </div>

          <div className="chip-row">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${filter === item ? "is-on" : ""}`}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item === "all" ? t("all") : t(typeKey[item])}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="dash-muted">{t("noSessions")}</p>
          ) : (
            groups.map(([label, items]) => (
              <section key={label} className="history-group">
                <h2>{label}</h2>
                <ol className="history-list">
                  {items.map((record, index) => (
                    <li key={`${record.date}-${index}`} className="history-item">
                      <div>
                        <p className="kicker">{t(typeKey[record.type] || "mixOther")}</p>
                        <h3>
                          {new Date(record.date).toLocaleDateString(locale, {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </h3>
                      </div>
                      <dl>
                        <div>
                          <dt>{t("duration")}</dt>
                          <dd className="tabular">{record.duration} {t("min")}</dd>
                        </div>
                        <div>
                          <dt>{t("volume")}</dt>
                          <dd className="tabular">{record.volume} {t("kcal")}</dd>
                        </div>
                        <div>
                          <dt>{t("sets")}</dt>
                          <dd className="tabular">{record.sets}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ol>
              </section>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default Activity;
