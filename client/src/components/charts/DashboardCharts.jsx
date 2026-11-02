import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { useLanguage } from "../../contexts/LanguageContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, BarController, LineController, ArcElement, Tooltip, Legend, Filler);

const ink = "#161616";
const muted = "rgba(22,22,22,.48)";
const gold = "#8a7340";
const teal = "#3d6b66";
const rust = "#8c4a32";
const olive = "#6a6848";
const stone = "#8a8478";

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: { boxWidth: 10, usePointStyle: true, font: { size: 12 }, color: ink, padding: 14 },
    },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: "rgba(22,22,22,.06)" }, ticks: { color: muted, font: { size: 12 } } },
    x: { grid: { display: false }, ticks: { color: muted, font: { size: 12 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
  },
};

const downsample = (series, maxPoints = 16) => {
  if (series.length <= maxPoints) return series;
  const step = Math.ceil(series.length / maxPoints);
  return series.filter((_, index) => index % step === 0 || index === series.length - 1);
};

const DashboardCharts = ({ analytics }) => {
  const { t, lang } = useLanguage();
  const series = useMemo(
    () => downsample(analytics?.series || [], analytics?.range > 30 ? 14 : 16),
    [analytics]
  );
  const weekly = analytics?.weekly || [];
  const weight = analytics?.weight || [];
  const mix = analytics?.mix || { cardio: 0, strength: 0, hiit: 0, yoga: 0, other: 0 };
  const heatmap = analytics?.heatmap || [];
  const hasData = (analytics?.kpis?.sessions || 0) > 0 || weight.length > 0;

  const mixItems = [
    ["mixCardio", mix.cardio, teal],
    ["mixStrength", mix.strength, ink],
    ["mixHiit", mix.hiit, rust],
    ["mixYoga", mix.yoga, olive],
    ["mixOther", mix.other, stone],
  ];
  const mixTotal = mixItems.reduce((sum, item) => sum + item[1], 0) || 1;

  if (!hasData) {
    return <div className="empty-chart">{t("noChartData")}</div>;
  }

  return (
    <div className="chart-grid" dir={lang === "ar" ? "rtl" : "ltr"}>
      <section className="dash-card span-8">
        <h3>{t("trainingLoad")}</h3>
        <p>{t("chartLoadHint")}</p>
        <div className="chart-box tall">
          <Bar
            data={{
              labels: series.map((point) => point.label),
              datasets: [
                {
                  label: t("caloriesBurned"),
                  data: series.map((point) => point.burn),
                  backgroundColor: ink,
                  borderRadius: 3,
                  yAxisID: "y",
                },
                {
                  type: "line",
                  label: t("sessionMinutes"),
                  data: series.map((point) => point.minutes),
                  borderColor: gold,
                  backgroundColor: "rgba(138,115,64,.12)",
                  tension: 0.35,
                  pointRadius: 0,
                  yAxisID: "y1",
                },
              ],
            }}
            options={{
              ...baseOptions,
              scales: {
                ...baseOptions.scales,
                y1: { position: "right", beginAtZero: true, grid: { display: false }, ticks: { color: muted, font: { size: 12 } } },
              },
            }}
          />
        </div>
      </section>

      <section className="dash-card span-4">
        <h3>{t("workoutMix")}</h3>
        <p>{t("chartMixHint")}</p>
        <ul className="mix-list">
          {mixItems.map(([key, value, color]) => (
            <li key={key}>
              <div className="mix-row">
                <span><i style={{ background: color }} />{t(key)}</span>
                <b className="tabular">{value}</b>
              </div>
              <span className="mix-bar" style={{ width: `${Math.round((value / mixTotal) * 100)}%`, background: color }} />
            </li>
          ))}
        </ul>
      </section>

      <section className="dash-card span-6">
        <h3>{t("weightTrend")}</h3>
        <p>{t("chartWeightHint")}</p>
        <div className="chart-box">
          {weight.length ? (
            <Line
              data={{
                labels: weight.map((point) => point.label),
                datasets: [{
                  label: t("weight"),
                  data: weight.map((point) => point.value),
                  borderColor: teal,
                  backgroundColor: "rgba(61,107,102,.12)",
                  fill: true,
                  tension: 0.3,
                  pointRadius: 2,
                  pointBackgroundColor: teal,
                }],
              }}
              options={{
                ...baseOptions,
                plugins: { ...baseOptions.plugins, legend: { display: false } },
                scales: {
                  ...baseOptions.scales,
                  y: { ...baseOptions.scales.y, beginAtZero: false },
                },
              }}
            />
          ) : (
            <p className="dash-muted">{t("noChartData")}</p>
          )}
        </div>
      </section>

      <section className="dash-card span-6">
        <h3>{t("energyBalance")}</h3>
        <p>{t("chartEnergyHint")}</p>
        <div className="chart-box">
          <Bar
            data={{
              labels: series.map((point) => point.label),
              datasets: [
                {
                  label: t("caloriesIn"),
                  data: series.map((point) => point.caloriesIn),
                  backgroundColor: gold,
                  borderRadius: 3,
                },
                {
                  label: t("caloriesBurned"),
                  data: series.map((point) => point.burn),
                  backgroundColor: ink,
                  borderRadius: 3,
                },
              ],
            }}
            options={baseOptions}
          />
        </div>
      </section>

      <section className="dash-card span-5">
        <h3>{t("weeklyVolume")}</h3>
        <p>{t("chartWeekHint")}</p>
        <div className="chart-box">
          <Bar
            data={{
              labels: weekly.map((week) => week.label),
              datasets: [{
                label: t("caloriesBurned"),
                data: weekly.map((week) => week.burn),
                backgroundColor: teal,
                borderRadius: 3,
              }],
            }}
            options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } }}
          />
        </div>
      </section>

      <section className="dash-card span-7">
        <h3>{t("consistency")}</h3>
        <p>{t("heatmapHint")}</p>
        <div className="heat-wrap">
        <div className="heat-grid" role="img" aria-label={t("consistency")}>
          {heatmap.map((day) => (
            <span
              key={day.key}
              title={`${day.key}: ${day.count}`}
              className={`heat heat-${Math.min(day.count, 3)}`}
            />
          ))}
        </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardCharts;
