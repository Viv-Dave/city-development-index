import React from "react";
import { IndicatorValues } from "../types";
import { formatRawValue } from "../utils/formatters";
import { ArrowUp, ArrowDown } from "lucide-react";

interface IndicatorProgressBarProps {
  indicator: IndicatorValues;
}

export const IndicatorProgressBar: React.FC<IndicatorProgressBarProps> = ({ indicator }) => {
  const isHigherBetter = indicator.direction === "positive";
  const score = indicator.normalized;

  const getBarColor = (val: number) => {
    if (val >= 75) return "bg-emerald-500";
    if (val >= 55) return "bg-blue-500";
    if (val >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="py-2.5 border-b border-slate-100 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between text-xs mb-1.5 gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{indicator.display_name}</span>
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
              isHigherBetter
                ? "bg-slate-100 text-slate-600"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
            title={isHigherBetter ? "Higher raw value yields higher CPI score" : "Lower raw value yields higher CPI score"}
          >
            {isHigherBetter ? (
              <>
                <ArrowUp className="w-3 h-3 text-emerald-600" /> Higher is better
              </>
            ) : (
              <>
                <ArrowDown className="w-3 h-3 text-rose-600" /> Lower is better
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Raw: <span className="font-semibold text-slate-800">{formatRawValue(indicator.raw, indicator.unit)}</span>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">
            Index: <span className="font-bold text-blue-700">{score.toFixed(1)}/100</span>
          </span>
        </div>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};
