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
  const defaultColors = [
    "#FCE365", // happy
    "#4D4C4C", // anxious
    "#041375", // sad
    "#520202", // angry
    "#FF7C02", // hungry
    "#BD0243", // flirty
  ];

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