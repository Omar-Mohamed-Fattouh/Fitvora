import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler
);

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
const yearLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const weekdayIndex = (date) => (new Date(date).getDay() + 6) % 7;

const seriesFromRecords = (records, key, range) => {
  if (range === "week") {
    const days = [0, 0, 0, 0, 0, 0, 0];
    records.forEach((record) => {
      if (!record?.date) return;
      days[weekdayIndex(record.date)] += record[key] || 0;
    });
    return days;
  }
  if (range === "month") {
    const weeks = [0, 0, 0, 0];
    records.forEach((record) => {
      if (!record?.date) return;
      const week = Math.min(3, Math.floor((new Date(record.date).getDate() - 1) / 7));
      weeks[week] += record[key] || 0;
    });
    return weeks;
  }
  const months = Array(12).fill(0);
  records.forEach((record) => {
    if (!record?.date) return;
    months[new Date(record.date).getMonth()] += record[key] || 0;
  });
  return months;
};

const Charts = ({ records = [], healthInfo = {} }) => {
  const [dateRange, setDateRange] = useState("week");
  const [currentPeriod, setCurrentPeriod] = useState("This Week");
  const safeRecords = Array.isArray(records) ? records : [];

  const handlePrevPeriod = () => {
    if (dateRange === "week") setCurrentPeriod("Last Week");
    else if (dateRange === "month") setCurrentPeriod("Last Month");
    else setCurrentPeriod("Last Year");
  };

  const handleNextPeriod = () => {
    if (dateRange === "week") setCurrentPeriod("This Week");
    else if (dateRange === "month") setCurrentPeriod("This Month");
    else setCurrentPeriod("This Year");
  };

  const labels = dateRange === "week" ? weekLabels : dateRange === "month" ? monthLabels : yearLabels;
  const calories = useMemo(() => seriesFromRecords(safeRecords, "volume", dateRange), [safeRecords, dateRange]);
  const duration = useMemo(() => seriesFromRecords(safeRecords, "duration", dateRange), [safeRecords, dateRange]);

  const activityScore = { sedentary: 35, light: 50, moderate: 70, active: 85, extreme: 95 };
  const current = activityScore[healthInfo.activityLevel] || 55;

  const workoutData = {
    labels,
    datasets: [{
      label: "Calories Burned",
      data: calories,
      backgroundColor: "rgba(79, 70, 229, 0.8)",
      borderRadius: 4,
    }],
  };

  const progressData = {
    labels,
    datasets: [{
      label: "Session minutes",
      data: duration,
      borderColor: "#7c3aed",
      backgroundColor: "rgba(124, 58, 237, 0.1)",
      fill: true,
      tension: 0.3,
      pointBackgroundColor: "#7c3aed",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  };

  const workoutTypeData = {
    labels: ["Cardio", "Strength", "HIIT", "Yoga", "Other"],
    datasets: [{
      data: healthInfo.preferredWorkoutType === "strength"
        ? [20, 45, 15, 10, 10]
        : healthInfo.preferredWorkoutType === "hiit"
          ? [20, 20, 40, 10, 10]
          : [40, 25, 15, 10, 10],
      backgroundColor: [
        "rgba(79, 70, 229, 0.8)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(219, 39, 119, 0.8)",
        "rgba(5, 150, 105, 0.8)",
        "rgba(217, 119, 6, 0.8)",
      ],
      borderColor: "white",
      borderWidth: 2,
    }],
  };

  const fitnessRadarData = {
    labels: ["Strength", "Cardio", "Flexibility", "Balance", "Endurance"],
    datasets: [
      {
        label: "Current",
        data: [current - 5, current, current - 15, current - 10, current + 5],
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        borderColor: "rgba(79, 70, 229, 0.8)",
        pointBackgroundColor: "rgba(79, 70, 229, 1)",
      },
      {
        label: "Goal",
        data: [85, 90, 80, 75, 95],
        backgroundColor: "rgba(219, 39, 119, 0.2)",
        borderColor: "rgba(219, 39, 119, 0.8)",
        pointBackgroundColor: "rgba(219, 39, 119, 1)",
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 10, usePointStyle: true, pointStyle: "circle", font: { size: 11 } },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(226, 232, 240, 0.8)" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Your Progress</h1>
          <p className="text-gray-500">Track your fitness journey over time</p>
        </div>
        <div className="flex items-center space-x-3 mt-3 md:mt-0">
          <button type="button" onClick={handlePrevPeriod} className="p-2 rounded-full hover:bg-gray-100" aria-label="Previous period">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center space-x-2 bg-white py-1.5 px-3 rounded-lg border">
            <Calendar size={16} className="text-gray-500" aria-hidden="true" />
            <span className="text-sm font-medium">{currentPeriod}</span>
          </div>
          <button
            type="button"
            onClick={handleNextPeriod}
            className="p-2 rounded-full hover:bg-gray-100"
            disabled={currentPeriod.includes("This")}
            aria-label="Next period"
          >
            <ArrowRight size={18} className={currentPeriod.includes("This") ? "text-gray-300" : "text-gray-700"} />
          </button>
        </div>
      </div>

      <div className="flex bg-white rounded-lg p-1 inline-block shadow-sm border">
        {[
          { id: "week", label: "Week", period: "This Week" },
          { id: "month", label: "Month", period: "This Month" },
          { id: "year", label: "Year", period: "This Year" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setDateRange(item.id); setCurrentPeriod(item.period); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md ${
              dateRange === item.id ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Workout Activity</h3>
          <div className="h-72">
            <Bar data={workoutData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Session Minutes</h3>
          <div className="h-72">
            <Line data={progressData} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Workout Type Distribution</h3>
          <div className="h-72 flex justify-center items-center">
            <div className="w-64 h-64">
              <Doughnut
                data={workoutTypeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  animation: false,
                  plugins: { legend: { position: "right", labels: { boxWidth: 10, padding: 15, font: { size: 11 } } } },
                  cutout: "60%",
                }}
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Fitness Assessment</h3>
          <div className="h-72 flex justify-center">
            <div className="w-72 h-72">
              <Radar
                data={fitnessRadarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  animation: false,
                  scales: { r: { beginAtZero: true, ticks: { backdropColor: "transparent", font: { size: 10 } } } },
                  plugins: { legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } } } },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
