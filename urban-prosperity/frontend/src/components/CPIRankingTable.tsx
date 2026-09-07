import React from "react";
import { CPIRankingItem } from "../types";
import { getCPITier } from "../utils/formatters";
import { ChevronRight, Award } from "lucide-react";

interface CPIRankingTableProps {
  rankings: CPIRankingItem[];
  selectedCityId: number | null;
  onSelectCity: (cityId: number) => void;
  onNavigateCity: (cityId: number) => void;
}

export const CPIRankingTable: React.FC<CPIRankingTableProps> = ({
  rankings,
  selectedCityId,
  onSelectCity,
  onNavigateCity,
}) => {
  return (
    <div className="analytical-card rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            National City Prosperity Index Rankings
          </h3>
          <p className="text-xs text-slate-500">
            Click any city row to update radar visualization or view comprehensive analytical profile
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100/70 text-xs font-semibold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-4 py-3 text-center w-12">Rank</th>
              <th scope="col" className="px-4 py-3">City</th>
              <th scope="col" className="px-4 py-3">State</th>
              <th scope="col" className="px-4 py-3 text-center">CPI</th>
              <th scope="col" className="px-4 py-3 text-right">Productivity</th>
              <th scope="col" className="px-4 py-3 text-right">Infrastructure</th>
              <th scope="col" className="px-4 py-3 text-right">Quality of Life</th>
              <th scope="col" className="px-4 py-3 text-right">Equity</th>
              <th scope="col" className="px-4 py-3 text-right">Environment</th>
              <th scope="col" className="px-4 py-3 text-right">Governance</th>
              <th scope="col" className="px-3 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {rankings.map((item) => {
              const isSelected = selectedCityId === item.city_id;
              const tier = getCPITier(item.overall_cpi);

              return (
                <tr
                  key={item.city_id}
                  onClick={() => onSelectCity(item.city_id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50/80 border-l-4 border-blue-600 font-medium text-slate-900"
                      : "hover:bg-slate-50/80 text-slate-700"
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                        item.rank === 1
                          ? "bg-amber-100 text-amber-800"
                          : item.rank === 2
                          ? "bg-slate-200 text-slate-800"
                          : item.rank === 3
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    {item.city}
                  </td>

                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {item.state}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border ${tier.bgColor} ${tier.color} ${tier.borderColor}`}
                    >
                      {item.overall_cpi.toFixed(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right tabular-nums text-xs">
                    {item.dimensions.productivity.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">
                    {item.dimensions.infrastructure.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">
                    {item.dimensions.quality_of_life.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">
                    {item.dimensions.equity.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">
                    {item.dimensions.environment.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-xs">
                    {item.dimensions.governance.toFixed(1)}
                  </td>

                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateCity(item.city_id);
                      }}
                      className="p-1 rounded hover:bg-slate-200/70 text-blue-600 transition-colors"
                      title="Open full city profile"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
