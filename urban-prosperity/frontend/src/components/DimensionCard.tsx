import React from "react";
import { IndicatorValues } from "../types";
import { DIMENSION_THEMES, formatRawValue } from "../utils/formatters";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DimensionCardProps {
  dimensionKey: string;
  score: number;
  indicators: Record<string, IndicatorValues>;
  keyIndicatorNames: string[];
}

export const DimensionCard: React.FC<DimensionCardProps> = ({
  dimensionKey,
  score,
  indicators,
  keyIndicatorNames,
}) => {
  const theme = DIMENSION_THEMES[dimensionKey] || {
    label: dimensionKey,
    color: "text-slate-700",
    stroke: "#475569",
    bg: "bg-slate-50",
  };

  const getStatus = (val: number) => {
    if (val >= 75) return { text: "Outstanding", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (val >= 60) return { text: "Progressive", badge: "bg-teal-50 text-teal-700 border-teal-200" };
    if (val >= 45) return { text: "Moderate", badge: "bg-amber-50 text-amber-700 border-amber-200" };
    return { text: "Priority Need", badge: "bg-rose-50 text-rose-700 border-rose-200" };
  };

  const status = getStatus(score);

  return (
    <div className="analytical-card rounded-xl p-5 flex flex-col justify-between transition-all">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              CPI Dimension
            </span>
            <h4 className="text-base font-bold text-slate-900">{theme.label}</h4>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${status.badge}`}>
            {status.text}
          </span>
        </div>

        {/* Big Score Display */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, score))}%`,
              backgroundColor: theme.stroke,
            }}
          />
        </div>

        {/* Key Indicators Snippet */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Primary Component Drivers
          </span>
          {keyIndicatorNames.map((name) => {
            const ind = indicators[name];
            if (!ind) return null;
            const isPositive = ind.direction === "positive";

            return (
              <div key={name} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 truncate max-w-[170px]" title={ind.display_name}>
                  {ind.display_name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {formatRawValue(ind.raw, ind.unit)}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center ${
                      ind.normalized >= 60
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-amber-700 bg-amber-50"
                    }`}
                  >
                    {ind.normalized.toFixed(0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
