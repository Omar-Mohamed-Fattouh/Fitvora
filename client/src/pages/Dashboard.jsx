import { useEffect, useState, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import api from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import WorkoutCard from "../components/dashboard/WorkoutCard";
import PageSkeleton from "../components/PageSkeleton";

const DashboardCharts = lazy(() => import("../components/charts/DashboardCharts"));

const insightText = (item, t) => {
  if (item.id === "bmi") return { title: t("insightBmi"), text: t("insightBmiText", { bmi: item.values.bmi, category: t(item.values.category) }) };
  if (item.id === "water") {
    return {
      title: t("insightWater"),
      text: item.values.hit ? t("insightWaterHit", item.values) : t("insightWaterLow", item.values),
    };
  }
  if (item.id === "train") {
    return {
      title: t("insightTrain"),
      text: item.values.done === 0 ? t("insightTrainReady") : t("insightTrainDone", item.values),
    };
  }
  if (item.id === "fuel") return { title: t("insightFuel"), text: t("insightFuelText", item.values) };
  if (item.id === "goal") {
    return item.values.goal === "weight-loss"
      ? { title: t("insightCut"), text: t("insightCutText") }
      : { title: t("insightBuild"), text: t("insightBuildText") };
  }
  return { title: item.id, text: "" };
};

const dayPart = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t("goodMorning");
  if (hour < 18) return t("goodAfternoon");
  return t("goodEvening");
};

const Delta = ({ value, suffix }) => {
  if (value === null || value === undefined) return null;
  const tone = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const prefix = value > 0 ? "+" : "";
  return <span className={`delta ${tone}`}>{prefix}{value}{suffix ? ` ${suffix}` : ""}</span>;
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [range, setRange] = useState(30);
  const [notification, setNotification] = useState(null);
  const { user, loading } = useUser();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const filled = (value) => value !== undefined && value !== null && value !== "";

  const loadSummary = async () => {
    const { data } = await api.get("/users/current/summary");
    setSummary(data);
    return data;
  };

  const loadAnalytics = async (nextRange = range) => {
    const { data } = await api.get(`/users/current/analytics?range=${nextRange}`);
    setAnalytics(data.analytics);
  };

  useEffect(() => {
    loadSummary().catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    loadAnalytics(range).catch(() => {});
  }, [range, lang]);

  useEffect(() => {
    if (!summary) return;
    const healthInfo = summary.healthInfo || {};
    if (!filled(healthInfo.height) || !filled(healthInfo.weight) || !filled(healthInfo.fitnessGoals)) {
      const timer = setTimeout(() => navigate("/health-info"), 3000);
      return () => clearTimeout(timer);
    }
  }, [summary, navigate]);

  useEffect(() => {
    if (location.state?.healthInfoUpdated) setNotification(t("healthUpdated"));
    if (location.state?.fromSignup) setNotification(t("accountReady", { name: location.state.fullName || user?.name || "" }));
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [location, user, t]);

  const addWater = async () => {
    const next = Math.min((summary.daily.water || 0) + 1, 12);
    await api.patch("/users/current/daily", { water: next });
    await loadSummary();
  };

  const completeWorkout = async (workout) => {
    await api.patch("/users/current/daily", { completeWorkoutId: workout.id });
    await api.patch("/users/addRecord", {
      date: new Date().toISOString(),
      duration: workout.duration,
      volume: workout.calories,
      sets: 8,
      type: workout.type,
    });
    await Promise.all([loadSummary(), loadAnalytics(range)]);
  };

  if (loading || !summary) {
    return <PageSkeleton variant="dashboard" />;
  }

  const healthInfo = summary.healthInfo || {};
  if (!filled(healthInfo.height) || !filled(healthInfo.weight) || !filled(healthInfo.fitnessGoals)) {
    return (
      <section className="dash-card pad">
        <h1>{t("completeProfile")}</h1>
        <p>{t("completeProfileText")}</p>
        <p className="dash-muted">{t("redirectingHealth")}</p>
      </section>
    );
  }

  const kpis = analytics?.kpis || {};
  const firstName = user?.name?.split(" ")[0] || "";
  const locale = lang === "ar" ? "ar" : "en-GB";
  const typeKey = { cardio: "mixCardio", strength: "mixStrength", hiit: "mixHiit", yoga: "mixYoga", other: "mixOther", nutrition: "nutrition" };

  return (
    <div className="dash-page">
      <Seo titleKey="seoDashTitle" descKey="todaySummary" path="/dashboard" />
      {notification && <p className="dash-banner" role="status">{notification}</p>}

      <header className="dash-head">
        <div>
          <p className="kicker">{new Date().toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>{t("welcomeBack", { part: dayPart(t), name: firstName })}</h1>
          <p>{t("dashSubtitle")}</p>
        </div>
        <div className="range-switch" role="group" aria-label={t("progressTitle")}>
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={range === value}
              className={range === value ? "is-on" : undefined}
              onClick={() => setRange(value)}
            >
              {t(`range${value}`)}
            </button>
          ))}
        </div>
      </header>

      <section className="kpi-row">
        <article className="dash-card kpi">
          <p>{t("kpiWeight")}</p>
          <strong className="tabular">{kpis.weight ?? healthInfo.weight}<span> kg</span></strong>
          <Delta value={kpis.weightDelta} suffix="kg" />
        </article>
        <article className="dash-card kpi">
          <p>{t("weeklySessions")}</p>
          <strong className="tabular">{kpis.sessions ?? 0}</strong>
          <Delta value={kpis.sessionsDelta} />
        </article>
        <article className="dash-card kpi">
          <p>{t("weeklyBurn")}</p>
          <strong className="tabular">{kpis.burn ?? 0}<span> {t("kcal")}</span></strong>
          <Delta value={kpis.burnDelta} />
        </article>
        <article className="dash-card kpi">
          <p>{t("kpiAdherence")}</p>
          <strong className="tabular">{kpis.adherence ?? 0}<span>%</span></strong>
          <Delta value={kpis.adherenceDelta} suffix="pt" />
        </article>
        <article className="dash-card kpi">
          <p>{t("dayStreak")}</p>
          <strong className="tabular">{summary.streak || 0}</strong>
          <span className="dash-muted">{t("today")}</span>
        </article>
        <article className="dash-card kpi">
          <p>{t("bmi")}</p>
          <strong className="tabular">{summary.metrics?.bmi || "—"}</strong>
          <span className="dash-muted">{t(summary.metrics?.bmiCategory || "unknown")}</span>
        </article>
      </section>

      <Suspense fallback={<PageSkeleton variant="charts" />}>
        {analytics ? <DashboardCharts analytics={analytics} /> : <PageSkeleton variant="charts" />}
      </Suspense>

      <section className="split-3">
        <article className="dash-card pad">
          <h3>{t("readiness")}</h3>
          <p>{t("readinessText", { adherence: kpis.adherence || 0 })}</p>
          <dl className="mini-dl">
            <div><dt>{t("bestWeek")}</dt><dd>{analytics?.bestWeek?.label || "—"} · {analytics?.bestWeek?.burn || 0} {t("kcal")}</dd></div>
            <div><dt>{t("missedDays")}</dt><dd className="tabular">{analytics?.missedDays ?? "—"}</dd></div>
            <div><dt>{t("avgProtein")}</dt><dd className="tabular">{kpis.avgProtein || 0}g</dd></div>
          </dl>
        </article>
        <article className="dash-card pad">
          <h3>{t("water")}</h3>
          <p>{summary.daily.water || 0} / {summary.metrics.waterGoal} {t("glasses")}</p>
          <div className="water-row" aria-hidden="true">
            {Array.from({ length: summary.metrics.waterGoal }).map((_, index) => (
              <span key={index} className={index < (summary.daily.water || 0) ? "on" : undefined} />
            ))}
          </div>
          <button type="button" className="text-btn" onClick={addWater}>{t("addGlass")}</button>
        </article>
        <article className="dash-card pad">
          <h3>{t("goal")}</h3>
          <p>{t(healthInfo.fitnessGoals || "maintenance")}</p>
          <p className="dash-muted">{t(healthInfo.activityLevel || "light")} · {t("caloriesToday")} {summary.daily?.caloriesLogged || 0}/{summary.metrics?.calorieTarget || "—"}</p>
        </article>
      </section>

      <section className="split-work">
        <article className="dash-card pad">
          <div className="card-head">
            <h3>{t("todaysWorkouts")}</h3>
            <button type="button" className="text-btn" onClick={() => navigate("/workouts")}>{t("viewAll")}</button>
          </div>
          <div className="workout-grid">
            {(summary.plan || []).map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={{ ...workout, title: t(workout.titleKey || workout.title), scheduled: `${workout.duration} ${t("min")}` }}
                onStart={() => completeWorkout(workout)}
                labels={{ start: t("start"), completed: t("completed"), min: t("min"), kcal: t("kcal") }}
              />
            ))}
          </div>
        </article>
        <article className="dash-card pad">
          <div className="card-head">
            <h3>{t("recentSessions")}</h3>
            <button type="button" className="text-btn" onClick={() => navigate("/activity")}>{t("viewActivity")}</button>
          </div>
          <ul className="session-list">
            {(analytics?.recent || []).slice(0, 6).map((record, index) => (
              <li key={`${record.date}-${index}`}>
                <span>{new Date(record.date).toLocaleDateString(locale, { day: "numeric", month: "short" })}</span>
                <b>{t(typeKey[record.type] || "mixOther")}</b>
                <span className="tabular">{record.duration} {t("min")}</span>
                <span className="tabular">{record.volume} {t("kcal")}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {summary.mealPlan?.length > 0 && (
        <section className="dash-card pad">
          <div className="card-head">
            <h3>{t("todaysPlate")}</h3>
            <button type="button" className="text-btn" onClick={() => navigate("/nutrition")}>{t("openNutrition")}</button>
          </div>
          <div className="plate-grid">
            {summary.mealPlan.map((meal) => (
              <article key={meal.id}>
                <p className="kicker">{t(meal.category)}</p>
                <h4>{t(meal.nameKey || meal.name)}</h4>
                <p>{meal.calories} {t("kcal")}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {summary.insights?.length > 0 && (
        <section className="insight-row">
          {summary.insights.map((item) => {
            const copy = insightText(item, t);
            return (
              <article key={item.id} className="dash-card pad">
                <h3>{copy.title}</h3>
                <p>{copy.text}</p>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
