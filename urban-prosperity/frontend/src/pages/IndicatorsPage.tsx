import React, { useState, useEffect } from "react";
import { cpiService } from "../services/cpiService";
import { IndicatorMetadata } from "../types";
import { Database, Search, ArrowUp, ArrowDown, RefreshCw, Filter } from "lucide-react";

export const IndicatorsPage: React.FC = () => {
  const [metadata, setMetadata] = useState<IndicatorMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDimension, setSelectedDimension] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const data = await cpiService.getIndicatorsMetadata();
        setMetadata(data);
      } catch (err) {
        console.error("Failed to load metadata", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  const dimensions = Array.from(new Set(metadata.map((m) => m.dimension)));

  const filtered = metadata.filter((m) => {
    const matchSearch =
      m.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDim = selectedDimension === "all" || m.dimension === selectedDimension;
    return matchSearch && matchDim;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
            Urban Data Catalog
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
          <Database className="w-7 h-7 text-teal-600" />
          City Development Indicators Registry ({metadata.length} Variables)
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl mt-1">
          Complete definition, measurement methodology, directionality, and cohort statistical extrema
          for all 24 normalized indicators contributing to the City Prosperity Index.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="analytical-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search indicator by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 capitalize"
          >
            <option value="all">All Dimensions</option>
            {dimensions.map((d) => (
              <option key={d} value={d}>
                {d.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500">Loading indicators catalog...</p>
        </div>
      ) : (
        <div className="analytical-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100/70 text-xs font-semibold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Indicator Name</th>
                  <th className="px-4 py-3.5">Dimension</th>
                  <th className="px-4 py-3.5 text-center">Direction</th>
                  <th className="px-4 py-3.5">Unit</th>
                  <th className="px-4 py-3.5 text-right">Min</th>
                  <th className="px-4 py-3.5 text-right">Mean</th>
                  <th className="px-4 py-3.5 text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-normal">
                {filtered.map((item) => {
                  const isPositive = item.direction === "positive";

                  return (
                    <tr key={item.name} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 text-sm">{item.display_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1 max-w-md leading-relaxed">
                          {item.description}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 capitalize font-medium text-slate-700">
                        {item.dimension.replace("_", " ")}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {isPositive ? (
                            <>
                              <ArrowUp className="w-3 h-3 text-emerald-600" /> Positive
                            </>
                          ) : (
                            <>
                              <ArrowDown className="w-3 h-3 text-rose-600" /> Negative
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {item.unit}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                        {item.min_value ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {item.mean_value ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                        {item.max_value ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
