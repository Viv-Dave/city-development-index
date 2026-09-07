import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { CPIDimensions } from "../types";

interface RadarDataCity {
  name: string;
  dimensions: CPIDimensions;
  stroke: string;
  fill: string;
}

interface RadarChartCPIProps {
  title?: string;
  cities: RadarDataCity[];
  height?: number;
}

export const RadarChartCPI: React.FC<RadarChartCPIProps> = ({
  title = "Six-Dimension Urban Prosperity Profile",
  cities,
  height = 360,
}) => {
  // Format dimension labels and data points
  const dimensionKeys = [
    { key: "productivity", label: "Productivity" },
    { key: "infrastructure", label: "Infrastructure" },
    { key: "quality_of_life", label: "Quality of Life" },
    { key: "equity", label: "Equity & Inclusion" },
    { key: "environment", label: "Environment" },
    { key: "governance", label: "Governance" },
  ];

  const chartData = dimensionKeys.map((dim) => {
    const item: Record<string, any> = {
      dimension: dim.label,
      fullMark: 100,
    };
    cities.forEach((c) => {
      item[c.name] = (c.dimensions as any)[dim.key] ?? 50;
    });
    return item;
  });

  return (
    <div className="analytical-card rounded-xl p-5 flex flex-col justify-between">
      {title && (
        <div className="mb-2">
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500">
            Dimension scores benchmarked on a 0-100 normalized performance scale
          </p>
        </div>
      )}

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
              stroke="#cbd5e1"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.5rem",
                color: "#ffffff",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#93c5fd" }}
            />
            {cities.map((city) => (
              <Radar
                key={city.name}
                name={city.name}
                dataKey={city.name}
                stroke={city.stroke}
                fill={city.fill}
                fillOpacity={0.35}
                strokeWidth={2}
              />
            ))}
            {cities.length > 1 && <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
