function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dayKey(value) {
  return startOfDay(value).toISOString().slice(0, 10);
}

function localeTag(locale = "en") {
  return locale === "ar" ? "ar" : "en-GB";
}

function labelFor(date, rangeDays, locale) {
  const tag = localeTag(locale);
  if (rangeDays <= 7) {
    return date.toLocaleDateString(tag, { weekday: "short" });
  }
  return date.toLocaleDateString(tag, { day: "numeric", month: "short" });
}

function sum(list, key) {
  return list.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function trainedDays(list) {
  return new Set(list.map((item) => dayKey(item.date))).size;
}

function inWindow(date, from, to) {
  const value = startOfDay(date);
  return value >= from && value <= to;
}

function mixCounts(list) {
  const counts = { cardio: 0, strength: 0, hiit: 0, yoga: 0, other: 0 };
  list.forEach((record) => {
    const type = record.type || "other";
    if (counts[type] !== undefined) counts[type] += 1;
    else counts.other += 1;
  });
  return counts;
}

export function buildAnalytics({
  records = [],
  weightHistory = [],
  nutritionHistory = [],
  range = 30,
  locale = "en",
}) {
  const rangeDays = [7, 30, 90].includes(Number(range)) ? Number(range) : 30;
  const today = startOfDay(new Date());
  const from = new Date(today);
  from.setDate(from.getDate() - (rangeDays - 1));

  const prevFrom = new Date(from);
  prevFrom.setDate(prevFrom.getDate() - rangeDays);
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);

  const safeRecords = records.filter((record) => record?.date);
  const current = safeRecords.filter((record) => inWindow(record.date, from, today));
  const previous = safeRecords.filter((record) => inWindow(record.date, prevFrom, prevTo));

  const nutrition = nutritionHistory.filter((item) => item?.date && inWindow(item.date, from, today));
  const prevNutrition = nutritionHistory.filter((item) => item?.date && inWindow(item.date, prevFrom, prevTo));
  const weights = weightHistory
    .filter((item) => item?.date && inWindow(item.date, from, today))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const prevWeights = weightHistory
    .filter((item) => item?.date && inWindow(item.date, prevFrom, prevTo))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const firstWeight = weights[0]?.weight;
  const lastWeight = weights[weights.length - 1]?.weight;
  const prevLastWeight = prevWeights[prevWeights.length - 1]?.weight;

  const avg = (list, key) => (list.length ? Math.round(sum(list, key) / list.length) : 0);

  const kpis = {
    sessions: current.length,
    sessionsDelta: current.length - previous.length,
    minutes: sum(current, "duration"),
    minutesDelta: sum(current, "duration") - sum(previous, "duration"),
    burn: sum(current, "volume"),
    burnDelta: sum(current, "volume") - sum(previous, "volume"),
    adherence: Math.round((trainedDays(current) / rangeDays) * 100),
    adherenceDelta:
      Math.round((trainedDays(current) / rangeDays) * 100) -
      Math.round((trainedDays(previous) / rangeDays) * 100),
    weight: lastWeight ? Number(lastWeight.toFixed(1)) : null,
    weightDelta:
      lastWeight && firstWeight ? Number((lastWeight - firstWeight).toFixed(1)) : null,
    weightVsPrev:
      lastWeight && prevLastWeight ? Number((lastWeight - prevLastWeight).toFixed(1)) : null,
    avgCaloriesIn: avg(nutrition, "calories"),
    avgProtein: avg(nutrition, "protein"),
    caloriesInDelta: avg(nutrition, "calories") - avg(prevNutrition, "calories"),
  };

  const recordByDay = new Map();
  current.forEach((record) => {
    const key = dayKey(record.date);
    const currentDay = recordByDay.get(key) || { burn: 0, minutes: 0, sessions: 0 };
    currentDay.burn += Number(record.volume) || 0;
    currentDay.minutes += Number(record.duration) || 0;
    currentDay.sessions += 1;
    recordByDay.set(key, currentDay);
  });

  const nutritionByDay = new Map();
  nutrition.forEach((item) => {
    nutritionByDay.set(dayKey(item.date), {
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
    });
  });

  const series = [];
  for (let offset = 0; offset < rangeDays; offset += 1) {
    const date = new Date(from);
    date.setDate(from.getDate() + offset);
    const key = dayKey(date);
    const day = recordByDay.get(key) || { burn: 0, minutes: 0, sessions: 0 };
    const fuel = nutritionByDay.get(key) || { calories: 0, protein: 0 };
    series.push({
      key,
      label: labelFor(date, rangeDays, locale),
      burn: day.burn,
      minutes: day.minutes,
      sessions: day.sessions,
      caloriesIn: fuel.calories,
      protein: fuel.protein,
    });
  }

  const weekly = [];
  const weekCount = Math.ceil(rangeDays / 7);
  for (let week = 0; week < weekCount; week += 1) {
    const slice = series.slice(week * 7, week * 7 + 7);
    weekly.push({
      label: slice[0]?.label || `W${week + 1}`,
      sessions: sum(slice, "sessions"),
      burn: sum(slice, "burn"),
      minutes: sum(slice, "minutes"),
      caloriesIn: sum(slice, "caloriesIn"),
    });
  }

  const heatmapFrom = new Date(today);
  heatmapFrom.setDate(today.getDate() - 83);
  const heatmap = [];
  for (let offset = 0; offset < 84; offset += 1) {
    const date = new Date(heatmapFrom);
    date.setDate(heatmapFrom.getDate() + offset);
    const key = dayKey(date);
    const count = safeRecords.filter((record) => dayKey(record.date) === key).length;
    heatmap.push({ key, count, weekday: date.getDay() });
  }

  const recent = [...safeRecords]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12)
    .map((record) => ({
      date: record.date,
      duration: record.duration,
      volume: record.volume,
      sets: record.sets,
      type: record.type || "other",
    }));

  const mix = mixCounts(current);
  const bestWeek = weekly.reduce(
    (best, week) => (week.burn > (best?.burn || 0) ? week : best),
    weekly[0] || { label: "—", burn: 0, sessions: 0 }
  );

  return {
    range: rangeDays,
    from: dayKey(from),
    to: dayKey(today),
    kpis,
    series,
    weekly,
    weight: weights.map((item) => ({
      key: dayKey(item.date),
      label: labelFor(new Date(item.date), rangeDays, locale),
      value: Number(item.weight.toFixed(1)),
    })),
    mix,
    heatmap,
    recent,
    bestWeek,
    missedDays: rangeDays - trainedDays(current),
  };
}
