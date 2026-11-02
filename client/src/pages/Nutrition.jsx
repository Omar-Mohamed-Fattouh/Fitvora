import { useEffect, useState } from "react";
import api from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import PageSkeleton from "../components/PageSkeleton";

const Nutrition = () => {
  const [meals, setMeals] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState("all");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const load = async () => {
    const [all, fav, current] = await Promise.all([
      api.get("/meals"),
      api.get("/users/current/fav"),
      api.get("/users/current/summary"),
    ]);
    setMeals(all.data.meals || []);
    setFavorites(fav.data.favMeals || []);
    setSummary(current.data);
  };

  useEffect(() => {
    load()
      .catch(() => setError(t("nutritionLoadError")))
      .finally(() => setReady(true));
  }, []);

  const isFav = (id) => favorites.some((meal) => meal._id === id);
  const loggedCount = (id) =>
    (summary?.daily?.loggedMeals || []).filter((meal) => meal.mealId === id).length;

  const toggleFav = async (meal) => {
    if (isFav(meal._id)) await api.delete(`/users/current/fav/${meal._id}`);
    else await api.post(`/users/current/fav/${meal._id}`);
    await load();
  };

  const logMeal = async (meal) => {
    setError("");
    try {
      await api.patch("/users/current/daily", { logMealId: meal._id });
      setMessage(t("mealLogged", { name: t(meal.nameKey || meal.name) }));
      await load();
    } catch {
      setError(t("couldNotLogMeal"));
    }
  };

  const visible = meals.filter((meal) => {
    if (filter === "favorites") return isFav(meal._id);
    return filter === "all" || meal.category === filter;
  });

  const eaten = summary?.daily?.caloriesLogged || 0;
  const target = summary?.metrics?.calorieTarget || 0;
  const percent = target ? Math.min(100, Math.round((eaten / target) * 100)) : 0;

  if (!ready) {
    return <PageSkeleton variant="cards" />;
  }

  return (
    <div className="dash-page">
      <Seo titleKey="seoNutritionTitle" descKey="nutritionSub" path="/nutrition" />
      <header className="dash-head">
        <div>
          <h1>{t("nutritionTitle")}</h1>
          <p>{t("nutritionSub")}</p>
        </div>
      </header>

      {error && <p className="notice bad" role="alert">{error}</p>}
      {message && <p className="notice ok" role="status">{message}</p>}

      <section className="dash-card pad">
        <div className="card-head">
          <h3>{t("todaysFuel")}</h3>
          <p className="tabular">{eaten} / {target || "—"} {t("kcal")}</p>
        </div>
        <div className="meter" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
        <p className="sr-only">{t("percentOfTarget", { percent })}</p>
        {(summary?.daily?.loggedMeals || []).length > 0 && (
          <ul className="session-list" style={{ marginTop: "0.9rem" }}>
            {summary.daily.loggedMeals.map((meal, index) => (
              <li key={`${meal.mealId}-${index}`}>
                <span>{t(meal.nameKey || meal.name)}</span>
                <b />
                <span className="tabular">{meal.calories} {t("kcal")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {summary?.mealPlan?.length > 0 && (
        <section>
          <h2 className="dash-head" style={{ fontSize: "1rem" }}>{t("suggestedPlate")}</h2>
          <div className="plate-grid">
            {summary.mealPlan.map((meal) => (
              <article key={meal.id} className="item-card">
                <p className="kicker">{t(meal.category)}</p>
                <h3>{t(meal.nameKey || meal.name)}</h3>
                <p className="dash-muted">{meal.calories} {t("kcal")} · {t("proteinShort")} {meal.protein}</p>
                <button type="button" className="text-btn" onClick={() => logMeal({ _id: meal.id, name: meal.name, nameKey: meal.nameKey })}>
                  {t("logThisMeal")}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="chip-row">
        {["all", "breakfast", "lunch", "dinner", "snack", "favorites"].map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} className={`chip ${filter === item ? "is-on" : ""}`}>
            {t(item)}
          </button>
        ))}
      </div>

      <div className="catalog-grid cols-3">
        {visible.map((meal) => (
          <article key={meal._id} className="item-card">
            <div className="card-head">
              <div>
                <p className="kicker">{t(meal.category)}</p>
                <h3>{t(meal.nameKey || meal.name)}</h3>
              </div>
              <button type="button" className={`fav-btn ${isFav(meal._id) ? "is-on" : ""}`} onClick={() => toggleFav(meal)} aria-label={isFav(meal._id) ? t("removeFavorite") : t("addFavorite")}>
                {isFav(meal._id) ? "♥" : "♡"}
              </button>
            </div>
            <p className="dash-muted">{t(meal.descriptionKey || meal.description)}</p>
            <p className="tabular">{meal.calories} {t("kcal")} · {t("proteinShort")} {meal.protein} · {t("carbsShort")} {meal.carbs} · {t("fatShort")} {meal.fat}</p>
            <button type="button" className="text-btn" onClick={() => logMeal(meal)}>
              {loggedCount(meal._id) > 0 ? t("loggedTimes", { count: loggedCount(meal._id) }) : t("logMeal")}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Nutrition;
