import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import Seo from "../components/Seo";

const Workouts = () => {
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [muscle, setMuscle] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const { t } = useLanguage();

  useEffect(() => {
    const load = async () => {
      try {
        const [ex, summary] = await Promise.all([
          api.get("/exercises/"),
          api.get("/users/current/summary"),
        ]);
        setExercises(ex.data.exercises || []);
        setPlans(summary.data.plan || []);
      } catch {
        setError(t("workoutsLoadError"));
      }
    };
    load();
  }, []);

  const complete = async (workout) => {
    try {
      const { data } = await api.patch("/users/current/daily", { completeWorkoutId: workout.id });
      await api.patch("/users/addRecord", {
        date: new Date().toISOString(),
        duration: workout.duration,
        volume: workout.calories,
        sets: 8,
        type: workout.type,
      });
      setPlans((prev) => prev.map((item) => (
        item.id === workout.id || data.daily.completedWorkouts.includes(item.id)
          ? { ...item, completed: true }
          : item
      )));
      setMessage(t("sessionComplete"));
    } catch {
      setError(t("couldNotComplete"));
    }
  };

  const logSession = async () => {
    await api.patch("/users/addRecord", {
      date: new Date().toISOString(),
      duration: 30,
      volume: 210,
      sets: 8,
      type: "strength",
    });
    setMessage(t("sessionLogged"));
  };

  const muscles = useMemo(
    () => ["all", ...new Set(exercises.map((item) => item.muscle))],
    [exercises]
  );

  const visible = exercises.filter((exercise) => (
    (muscle === "all" || exercise.muscle === muscle) &&
    (difficulty === "all" || exercise.difficulty === difficulty)
  ));

  const done = plans.filter((item) => item.completed).length;

  return (
    <div className="dash-page">
      <Seo titleKey="seoWorkoutsTitle" descKey="workoutsTitle" path="/workouts" />
      <header className="dash-head">
        <div>
          <h1>{t("workoutsTitle")}</h1>
          <p>{t("workoutsSub", { done, total: plans.length || 0 })}</p>
        </div>
        <button type="button" className="text-btn" onClick={logSession}>{t("log30")}</button>
      </header>

      {error && <p className="notice bad" role="alert">{error}</p>}
      {message && <p className="notice ok" role="status">{message}</p>}

      <div className="catalog-grid cols-2">
        {plans.map((workout) => (
          <article key={workout.id} className={`item-card ${workout.completed ? "is-done" : ""}`}>
            <p className="kicker">{t(workout.type)}</p>
            <h3>{t(workout.titleKey || workout.title)}</h3>
            <p className="dash-muted">{workout.duration} {t("min")} · {workout.calories} {t("kcal")}</p>
            <button
              type="button"
              disabled={workout.completed}
              onClick={() => complete(workout)}
              className={workout.completed ? "text-btn" : "ink-btn"}
            >
              {workout.completed ? t("completed") : t("start")}
            </button>
          </article>
        ))}
      </div>

      <section className="dash-card pad">
        <div className="card-head">
          <h3>{t("exerciseLibrary")}</h3>
        </div>
        <div className="chip-row" style={{ marginBottom: "0.6rem" }}>
          {muscles.map((item) => (
            <button key={item} type="button" onClick={() => setMuscle(item)} aria-pressed={muscle === item} className={`chip ${muscle === item ? "is-on" : ""}`}>
              {t(item)}
            </button>
          ))}
        </div>
        <div className="chip-row" style={{ marginBottom: "0.9rem" }}>
          {["all", "beginner", "intermediate", "advanced"].map((item) => (
            <button key={item} type="button" onClick={() => setDifficulty(item)} aria-pressed={difficulty === item} className={`chip ${difficulty === item ? "is-on" : ""}`}>
              {t(item)}
            </button>
          ))}
        </div>
        <div className="catalog-grid cols-3">
          {visible.map((exercise) => (
            <article key={exercise._id} className="item-card">
              <h3>{t(exercise.nameKey || exercise.name)}</h3>
              <p className="dash-muted">{t(exercise.muscle)} · {t(exercise.difficulty)} · {exercise.duration || 8} {t("min")}</p>
              {(exercise.instructionsKey || exercise.instructions) && (
                <p>{t(exercise.instructionsKey || exercise.instructions)}</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Workouts;
