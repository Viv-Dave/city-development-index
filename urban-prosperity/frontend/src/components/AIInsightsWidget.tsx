import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

interface AIInsightsWidgetProps {
  cityName: string;
  insights: string[];
}

export const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ cityName, insights }) => {
  const getInsightIcon = (index: number) => {
    switch (index % 4) {
      case 0:
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 1:
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      case 2:
        return <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
      default:
        return <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="analytical-card rounded-xl p-5 border-l-4 border-indigo-600 bg-gradient-to-br from-white to-indigo-50/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-indigo-100 text-indigo-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            AI-Derived Urban Prosperity Insights
          </h4>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
          Dynamic Indicator Synthesis
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Synthesized in real-time from normalized performance deltas across the 10-city Indian metropolitan cohort.
      </p>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200/80 shadow-xs"
          >
            {getInsightIcon(idx)}
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
