import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Register chart elements once
ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

/**
 * Reusable Chart Component
 *
 * Props:
 *  - type: "bar" | "pie"
 *  - title: string
 *  - labels: string[]
 *  - data: number[]
 *  - colors?: string[]
 */
export default function ChartComponent({ type, title, labels, data, colors }) {
  const MOOD_COLORS = {
    happy: "#FFD700",
    anxious: "#875ecec0",
    sad: "#4169E1",
    angry: "#FF4500",
    hungry: "#32CD32",
    flirty: "#FF69B4",
  };

  const defaultColors = labels.map(
    (label) => MOOD_COLORS[label.toLowerCase()] || "#9f84bd"
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: colors || defaultColors.slice(0, labels.length),
        borderWidth: 0,
        borderRadius: type === "bar" ? 8 : 0,
      },
    ],
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>

      {type === "bar" && <Bar data={chartData} />}
      {type === "pie" && <Pie data={chartData} />}
    </div>
  );
}