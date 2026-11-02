export function parseRange(value) {
  if (!value) return null;
  const [min, max] = String(value).split("-").map(Number);
  if (!min || !max) return Number(value) || null;
  return (min + max) / 2;
}

export function calcBmi(heightRange, weightRange) {
  const height = parseRange(heightRange);
  const weight = parseRange(weightRange);
  if (!height || !weight) return null;
  const meters = height / 100;
  return Number((weight / (meters * meters)).toFixed(1));
}

export function calcAge(birthDate) {
  if (!birthDate) return 28;
  const age = Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return age > 10 && age < 90 ? age : 28;
}

export function calcTdee({ gender, birthDate, height, weight, activityLevel }) {
  const h = parseRange(height) || 170;
  const w = parseRange(weight) || 70;
  const age = calcAge(birthDate);
  const bmr = gender === "female"
    ? 10 * w + 6.25 * h - 5 * age - 161
    : 10 * w + 6.25 * h - 5 * age + 5;

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9,
  };

  return Math.round(bmr * (multipliers[activityLevel] || 1.375));
}

export function calorieTarget(tdee, fitnessGoals) {
  if (fitnessGoals === "weight-loss") return tdee - 400;
  if (fitnessGoals === "muscle-gain") return tdee + 300;
  return tdee;
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function bmiCategory(bmi) {
  if (!bmi) return "unknown";
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obese";
}

export function buildMealPlan(meals = [], goal = "maintenance") {
  const groups = {
    breakfast: meals.filter((meal) => meal.category === "breakfast"),
    lunch: meals.filter((meal) => meal.category === "lunch"),
    dinner: meals.filter((meal) => meal.category === "dinner"),
    snack: meals.filter((meal) => meal.category === "snack"),
  };

  const pick = (list) => {
    if (!list.length) return null;
    if (goal === "weight-loss") return [...list].sort((a, b) => a.calories - b.calories)[0];
    if (goal === "muscle-gain") return [...list].sort((a, b) => b.protein - a.protein)[0];
    return list[Math.min(1, list.length - 1)];
  };

  return ["breakfast", "lunch", "dinner", "snack"]
    .map((category) => pick(groups[category]))
    .filter(Boolean)
    .map((meal) => ({
      id: String(meal._id),
      name: meal.name,
      nameKey: meal.nameKey || "",
      descriptionKey: meal.descriptionKey || "",
      category: meal.category,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      description: meal.description,
    }));
}

export function buildInsights({ bmi, streak, daily, metrics, healthInfo }) {
  const insights = [];
  const category = bmiCategory(bmi);
  if (bmi) insights.push({ id: "bmi", values: { bmi, category } });
  const waterGoal = metrics?.waterGoal || 8;
  const water = daily?.water || 0;
  insights.push({ id: "water", values: { water, goal: waterGoal, hit: water >= waterGoal } });
  insights.push({
    id: "train",
    values: { done: daily?.completedWorkouts?.length || 0, streak: streak || 0 },
  });
  if (metrics?.calorieTarget) {
    insights.push({
      id: "fuel",
      values: { eaten: daily?.caloriesLogged || 0, target: metrics.calorieTarget },
    });
  }
  if (healthInfo?.fitnessGoals === "weight-loss" || healthInfo?.fitnessGoals === "muscle-gain") {
    insights.push({ id: "goal", values: { goal: healthInfo.fitnessGoals } });
  }
  return insights.slice(0, 4);
}

export function weekStats(records = [], daily = {}) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const recent = records.filter((record) => record?.date && new Date(record.date) >= start);
  return {
    sessions: recent.length,
    minutes: recent.reduce((sum, record) => sum + (record.duration || 0), 0),
    calories: recent.reduce((sum, record) => sum + (record.volume || 0), 0),
    protein: (daily.loggedMeals || []).reduce((sum, meal) => sum + (meal.protein || 0), 0),
  };
}

export function buildDailyPlan(healthInfo = {}) {
  const goal = healthInfo.fitnessGoals || "maintenance";
  const type = healthInfo.preferredWorkoutType || "mixed";

  const plans = {
    "weight-loss": [
      { id: "am-walk", titleKey: "workout_am_walk", title: "Brisk Morning Walk", type: "cardio", duration: 25, calories: 180 },
      { id: "hiit", titleKey: "workout_hiit", title: "Fat-Burn HIIT", type: "hiit", duration: 20, calories: 240 },
      { id: "core", titleKey: "workout_core", title: "Core Finisher", type: "strength", duration: 12, calories: 80 },
      { id: "cycle", titleKey: "workout_cycle", title: "Easy Cycle", type: "cardio", duration: 20, calories: 160 },
    ],
    "muscle-gain": [
      { id: "push", titleKey: "workout_push", title: "Upper Body Strength", type: "strength", duration: 40, calories: 260 },
      { id: "legs", titleKey: "workout_legs", title: "Lower Body Strength", type: "strength", duration: 35, calories: 240 },
      { id: "walk", titleKey: "workout_walk", title: "Recovery Walk", type: "cardio", duration: 15, calories: 90 },
      { id: "protein", titleKey: "workout_protein", title: "High-Protein Meal Prep", type: "nutrition", duration: 20, calories: 0 },
    ],
    endurance: [
      { id: "run", titleKey: "workout_run", title: "Steady Run", type: "cardio", duration: 35, calories: 320 },
      { id: "row", titleKey: "workout_row", title: "Row Intervals", type: "cardio", duration: 18, calories: 210 },
      { id: "mobility", titleKey: "workout_mobility", title: "Mobility Flow", type: "yoga", duration: 15, calories: 70 },
      { id: "core", titleKey: "workout_core", title: "Core Finisher", type: "strength", duration: 10, calories: 70 },
    ],
    rehabilitation: [
      { id: "mobility", titleKey: "workout_gentle", title: "Gentle Mobility", type: "yoga", duration: 20, calories: 60 },
      { id: "walk", titleKey: "workout_easy", title: "Easy Walk", type: "cardio", duration: 15, calories: 70 },
      { id: "core", titleKey: "workout_core_easy", title: "Supported Core", type: "strength", duration: 10, calories: 40 },
      { id: "stretch", titleKey: "workout_stretch", title: "Evening Stretch", type: "yoga", duration: 12, calories: 50 },
    ],
    mobility: [
      { id: "flow", titleKey: "workout_mobility", title: "Mobility Flow", type: "yoga", duration: 25, calories: 90 },
      { id: "walk", titleKey: "workout_easy", title: "Easy Walk", type: "cardio", duration: 20, calories: 90 },
      { id: "stretch", titleKey: "workout_stretch", title: "Evening Stretch", type: "yoga", duration: 12, calories: 50 },
    ],
    recomposition: [
      { id: "push", titleKey: "workout_push", title: "Upper Body Strength", type: "strength", duration: 35, calories: 230 },
      { id: "hiit", titleKey: "workout_hiit", title: "Fat-Burn HIIT", type: "hiit", duration: 16, calories: 200 },
      { id: "walk", titleKey: "workout_walk", title: "Recovery Walk", type: "cardio", duration: 15, calories: 90 },
      { id: "core", titleKey: "workout_core", title: "Core Finisher", type: "strength", duration: 10, calories: 70 },
    ],
    maintenance: [
      { id: "balanced", titleKey: "workout_balanced", title: "Balanced Full Body", type: type === "cardio" ? "cardio" : "strength", duration: 30, calories: 200 },
      { id: "walk", titleKey: "workout_walk", title: "Recovery Walk", type: "cardio", duration: 20, calories: 110 },
      { id: "core", titleKey: "workout_core", title: "Core Finisher", type: "strength", duration: 12, calories: 80 },
      { id: "stretch", titleKey: "workout_stretch", title: "Evening Stretch", type: "yoga", duration: 12, calories: 50 },
    ],
  };

  return plans[goal] || plans.maintenance;
}
