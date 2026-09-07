import React from "react";
import { ExplainabilityResponse } from "../types";
import { HelpCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SHAPFeatureImportanceProps {
  explainability: ExplainabilityResponse;
}

export const SHAPFeatureImportance: React.FC<SHAPFeatureImportanceProps> = ({ explainability }) => {
  // Find maximum absolute shap value for scaling the bar widths
  const maxAbs = Math.max(...explainability.features.map((f) => Math.abs(f.shap_value)), 1.0);

  return (
    <div className="analytical-card rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            What is Influencing This City's Estimated Indicator?
          </h4>
          <p className="text-xs text-slate-500">
            SHAP (SHapley Additive exPlanations) Feature Attributions for {explainability.city}
          </p>
        </div>

        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          {explainability.model_used}
        </span>
      </div>

      {/* Target Metric & Base Value Pill */}
      <div className="my-3 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-slate-600">
          Target: <strong className="text-slate-900">{explainability.target_metric}</strong>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Cohort Base: <strong>{explainability.base_value.toFixed(1)}</strong>
          </span>
          <span className="text-slate-400">→</span>
          <span className="text-slate-500">
            Estimated Value: <strong className="text-blue-700 font-bold">{explainability.predicted_value.toFixed(1)}</strong>
          </span>
        </div>
      </div>

      {/* Explanation Summary */}
      <p className="text-xs text-slate-600 italic mb-4 font-medium">
        "{explainability.summary}"
      </p>

      {/* Horizontal Bars */}
      <div className="space-y-2.5">
        {explainability.features.map((item) => {
          const isPositive = item.shap_value >= 0;
          const barWidthPercent = (Math.abs(item.shap_value) / maxAbs) * 100;

          return (
            <div key={item.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  {isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  {item.display_name}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    raw: {item.raw_value}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      isPositive ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isPositive ? `+${item.shap_value.toFixed(2)}` : item.shap_value.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stacked/Directional Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPositive ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.max(4, barWidthPercent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-emerald-500 inline-block"></span> Positive Driver (Adds to prosperity)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-rose-500 inline-block"></span> Negative Drag (Reduces prosperity)
        </span>
      </div>
    </div>
  );
};
