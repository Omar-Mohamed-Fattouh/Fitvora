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

const ink = "#1f2937";
const muted = "#94a3b8";
const indigo = "#3730a3";
const rust = "#9a3412";

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: { boxWidth: 8, usePointStyle: true, font: { size: 11 }, color: ink },
    },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: "rgba(15,23,42,.06)" }, ticks: { color: muted, font: { size: 10 } } },
    x: { grid: { display: false }, ticks: { color: muted, font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
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
    ["mixCardio", mix.cardio, "#3730a3"],
    ["mixStrength", mix.strength, "#1d4ed8"],
    ["mixHiit", mix.hiit, "#9f1239"],
    ["mixYoga", mix.yoga, "#047857"],
    ["mixOther", mix.other, "#b45309"],
  ];
  const mixTotal = mixItems.reduce((sum, item) => sum + item[1], 0) || 1;

  if (!hasData) {
    return <div className="empty-chart">{t("noChartData")}</div>;
  }

  return (
    <div className="chart-grid" dir={lang === "ar" ? "rtl" : "ltr"}>
      <section className="dash-card span-8">
        <h3>{t("trainingLoad")}</h3>
        <p>{t("thisPeriod")}</p>
        <div className="chart-box tall">
          <Bar
            data={{
              labels: series.map((point) => point.label),
              datasets: [
                {
                  label: t("caloriesBurned"),
                  data: series.map((point) => point.burn),
                  backgroundColor: "rgba(55,48,163,.85)",
                  borderRadius: 3,
                  yAxisID: "y",
                },
                {
                  type: "line",
                  label: t("sessionMinutes"),
                  data: series.map((point) => point.minutes),
                  borderColor: rust,
                  backgroundColor: "rgba(154,52,18,.08)",
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
                y1: { position: "right", beginAtZero: true, grid: { display: false }, ticks: { color: muted, font: { size: 10 } } },
              },
            }}
          />
        </div>
      </section>

      <section className="dash-card span-4">
        <h3>{t("workoutMix")}</h3>
        <p>{t("thisPeriod")}</p>
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
        <p>{t("kpiWeight")}</p>
        <div className="chart-box">
          {weight.length ? (
            <Line
              data={{
                labels: weight.map((point) => point.label),
                datasets: [{
                  label: t("weight"),
                  data: weight.map((point) => point.value),
                  borderColor: indigo,
                  backgroundColor: "rgba(55,48,163,.08)",
                  fill: true,
                  tension: 0.3,
                  pointRadius: 2,
                  pointBackgroundColor: indigo,
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
        <p>{t("caloriesIn")} / {t("caloriesBurned")}</p>
        <div className="chart-box">
          <Bar
            data={{
              labels: series.map((point) => point.label),
              datasets: [
                {
                  label: t("caloriesIn"),
                  data: series.map((point) => point.caloriesIn),
                  backgroundColor: "rgba(15,23,42,.28)",
                  borderRadius: 3,
                },
                {
                  label: t("caloriesBurned"),
                  data: series.map((point) => point.burn),
                  backgroundColor: "rgba(55,48,163,.85)",
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
        <p>{t("caloriesBurned")}</p>
        <div className="chart-box">
          <Bar
            data={{
              labels: weekly.map((week) => week.label),
              datasets: [{
                label: t("caloriesBurned"),
                data: weekly.map((week) => week.burn),
                backgroundColor: "rgba(55,48,163,.8)",
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
