import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const weekdayIndex = (date) => (new Date(date).getDay() + 6) % 7;

const ProgressChart = ({ records = [] }) => {
  const chart = useMemo(() => {
    const volume = [0, 0, 0, 0, 0, 0, 0];
    records.forEach((record) => {
      if (!record?.date) return;
      volume[weekdayIndex(record.date)] += record.volume || record.duration * 8 || 0;
    });

    return {
      labels: days,
      datasets: [
        {
          label: "Training Volume",
          data: volume,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.12)",
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [records]);

  return (
    <Line
      options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { position: "top" } },
        scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
      }}
      data={chart}
    />
  );
};

export default ProgressChart;
