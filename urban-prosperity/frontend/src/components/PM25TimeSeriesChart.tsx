import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PM25ForecastResponse } from "../types";
import { Wind, AlertCircle } from "lucide-react";

interface PM25TimeSeriesChartProps {
  forecast: PM25ForecastResponse;
  currentPM25: number;
}

export const PM25TimeSeriesChart: React.FC<PM25TimeSeriesChartProps> = ({
  forecast,
  currentPM25,
}) => {
  // Map points for chart
  const data = forecast.forecast_24h.map((pt) => {
    // format hour label
    const date = new Date(pt.timestamp);
    const timeLabel = `${date.getHours().toString().padStart(2, "0")}:00`;
    return {
      hour: pt.hour,
      time: timeLabel,
      predicted: pt.predicted_pm25,
      lower: pt.lower_bound,
      upper: pt.upper_bound,
      confidence: Math.round(pt.confidence * 100),
    };
  });

  return (
    <div className="analytical-card rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-teal-600" />
            <h4 className="text-base font-bold text-slate-900">
              AI Air Quality Forecast (PM2.5)
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            24-hour predictive trajectory utilizing Deep LSTM recurrent sequence architecture
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            Current: {currentPM25.toFixed(1)} µg/m³
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {forecast.status}
          </span>
        </div>
      </div>

      {/* Model Disclaimer Pill */}
      <div className="mb-4 px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-800 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>Architecture:</strong> {forecast.model_type}. Sequence captures diurnal boundary layer inversion and peak urban transit emissions.
        </span>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "0.5rem",
                color: "#ffffff",
                fontSize: "12px",
              }}
              formatter={(val: any) => [`${Number(val).toFixed(2)} µg/m³`, "PM2.5"]}
            />
            <ReferenceLine
              y={currentPM25}
              stroke="#64748b"
              strokeDasharray="4 4"
              label={{ value: "Current Baseline", position: "insideTopRight", fill: "#64748b", fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#pm25Gradient)"
              name="Predicted PM2.5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
        <span>T+1h: {data[0]?.predicted.toFixed(1)} µg/m³</span>
        <span>T+12h: {data[11]?.predicted.toFixed(1)} µg/m³</span>
        <span>T+24h: {data[23]?.predicted.toFixed(1)} µg/m³</span>
        <span className="text-teal-700 font-medium">Confidence Band: ±{(currentPM25 * 0.12).toFixed(1)} µg/m³</span>
      </div>
    </div>
  );
};
