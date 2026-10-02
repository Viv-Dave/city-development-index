import React from "react";
import { IndicatorValues } from "../types";
import { formatRawValue } from "../utils/formatters";
import { ArrowUp, ArrowDown } from "lucide-react";

interface IndicatorProgressBarProps {
  indicator: IndicatorValues;
}

export const IndicatorProgressBar: React.FC<IndicatorProgressBarProps> = ({ indicator }) => {
  const isContextual = indicator.direction === "contextual";
  const isHigherBetter = indicator.direction === "positive";
  const score = indicator.normalized;

  const getBarColor = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "bg-slate-300";
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
              isContextual
                ? "bg-slate-100 text-slate-500"
                : isHigherBetter
                ? "bg-slate-100 text-slate-600"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {isContextual ? (
              <>Contextual Metric</>
            ) : isHigherBetter ? (
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
          {!isContextual && score !== null && score !== undefined && (
            <>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">
                Index: <span className="font-bold text-blue-700">{(score).toFixed(1)}/100</span>
              </span>
            </>
          )}
        </div>
      </div>

      {!isContextual && score !== null && score !== undefined && (
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(score)}`}
            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
