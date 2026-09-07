import React, { useState, useEffect } from "react";
import { cpiService } from "../services/cpiService";
import { CityComparisonResponse, CityDetail } from "../types";
import { RadarChartCPI } from "../components/RadarChartCPI";
import { formatRawValue } from "../utils/formatters";
import { 
  GitCompare, 
  Check, 
  Plus, 
  X, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw,
  Award
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PALETTE = [
  { stroke: "#2563eb", fill: "#3b82f6" }, // Blue
  { stroke: "#059669", fill: "#10b981" }, // Emerald
  { stroke: "#d97706", fill: "#f59e0b" }, // Amber
  { stroke: "#7c3aed", fill: "#8b5cf6" }, // Purple
  { stroke: "#e11d48", fill: "#f43f5e" }, // Rose
];

export const CompareCities: React.FC = () => {
  const [allCities, setAllCities] = useState<CityDetail[]>([]);
  const [selectedCityIds, setSelectedCityIds] = useState<number[]>([1, 2, 3]); // Mumbai, Pune, Bengaluru by default
  const [comparisonData, setComparisonData] = useState<CityComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCityList = async () => {
      try {
        const cities = await cpiService.getCities();
        setAllCities(cities);
      } catch (err) {
        console.error("Failed to load cities for comparison picker", err);
      }
    };
    fetchCityList();
  }, []);

  const runComparison = async (ids: number[]) => {
    if (ids.length < 2) return;
    try {
      setLoading(true);
      setError(null);
      const res = await cpiService.compareCities(ids);
      setComparisonData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load comparison data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison(selectedCityIds);
  }, [selectedCityIds]);

  const toggleCitySelection = (cityId: number) => {
    if (selectedCityIds.includes(cityId)) {
      if (selectedCityIds.length <= 2) {
        alert("Please keep at least 2 cities selected for comparative analysis.");
        return;
      }
      setSelectedCityIds(selectedCityIds.filter((id) => id !== cityId));
    } else {
      if (selectedCityIds.length >= 5) {
        alert("Maximum 5 cities can be compared simultaneously.");
        return;
      }
      setSelectedCityIds([...selectedCityIds, cityId]);
    }
  };

  // Prepare dimension comparison bar chart data
  const dimensionLabels = [
    { key: "productivity", label: "Productivity" },
    { key: "infrastructure", label: "Infrastructure" },
    { key: "quality_of_life", label: "Quality of Life" },
    { key: "equity", label: "Equity" },
    { key: "environment", label: "Environment" },
    { key: "governance", label: "Governance" },
  ];

  const dimensionBarData = dimensionLabels.map((dim) => {
    const row: Record<string, any> = { dimension: dim.label };
    comparisonData?.cities.forEach((c) => {
      row[c.city] = (c.dimensions as any)[dim.key];
    });
    return row;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
            Multi-City Analytics
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
          <GitCompare className="w-7 h-7 text-indigo-600" />
          Comparative Urban Prosperity Analysis
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl mt-1">
          Select between 2 to 5 Indian metropolitan centres to cross-evaluate dimensional parity,
          infrastructure deficits, environmental footprints, and competitive advantages.
        </p>
      </div>

      {/* City Selector Pills */}
      <div className="analytical-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cohort City Selection ({selectedCityIds.length} of 5 selected)
          </span>
          <span className="text-xs text-slate-400">Click to add or remove</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allCities.map((c) => {
            const isSelected = selectedCityIds.includes(c.city_id);
            return (
              <button
                key={c.city_id}
                onClick={() => toggleCitySelection(c.city_id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                {c.city}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Computing cohort comparative matrix...</p>
        </div>
      )}

      {error && !loading && (
        <div className="analytical-card p-6 text-center text-rose-600 text-sm">
          {error}
        </div>
      )}

      {comparisonData && !loading && (
        <>
          {/* Top Level CPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {comparisonData.cities.map((city, idx) => {
              const pal = PALETTE[idx % PALETTE.length];
              return (
                <div
                  key={city.city_id}
                  className="analytical-card rounded-xl p-5 border-t-4"
                  style={{ borderTopColor: pal.stroke }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-slate-900">{city.city}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Rank #{city.rank}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{city.state}</div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold" style={{ color: pal.stroke }}>
                      {city.overall_cpi.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ 100</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] space-y-1">
                    <div className="text-slate-600">
                      Top Advantage:{" "}
                      <strong className="text-emerald-700 block truncate">
                        {comparisonData.strengths_and_weaknesses[city.city]?.top_advantage}
                      </strong>
                    </div>
                    <div className="text-slate-600">
                      Deficit Area:{" "}
                      <strong className="text-rose-700 block truncate">
                        {comparisonData.strengths_and_weaknesses[city.city]?.primary_deficit}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Comparison: Multi-polygon Radar & Dimension Grouped Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Multi-City Radar Profile (5 cols) */}
            <div className="lg:col-span-5">
              <RadarChartCPI
                title="Superimposed Dimension Radar"
                cities={comparisonData.cities.map((c, i) => ({
                  name: c.city,
                  dimensions: c.dimensions,
                  stroke: PALETTE[i % PALETTE.length].stroke,
                  fill: PALETTE[i % PALETTE.length].fill,
                }))}
                height={340}
              />
            </div>

            {/* Dimension-by-Dimension Grouped Bar Chart (7 cols) */}
            <div className="lg:col-span-7 analytical-card rounded-xl p-5 flex flex-col justify-between">
              <div className="mb-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Dimension-by-Dimension Score Breakdown
                </h4>
                <p className="text-xs text-slate-500">
                  Side-by-side performance across all 6 core urban prosperity dimensions
                </p>
              </div>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dimensionBarData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="dimension" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.5rem",
                        color: "#ffffff",
                        fontSize: "12px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    {comparisonData.cities.map((c, idx) => (
                      <Bar
                        key={c.city}
                        dataKey={c.city}
                        fill={PALETTE[idx % PALETTE.length].stroke}
                        radius={[3, 3, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Granular Indicator Comparison Matrix */}
          <div className="analytical-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-base font-bold text-slate-900">
                Granular Indicator Comparison Matrix
              </h4>
              <p className="text-xs text-slate-500">
                Normalized index values (0-100) compared across selected urban centres
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100/70 text-xs font-semibold uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Indicator</th>
                    <th className="px-4 py-3">Dimension</th>
                    {comparisonData.cities.map((c, idx) => (
                      <th key={c.city} className="px-4 py-3 text-right">
                        <span style={{ color: PALETTE[idx % PALETTE.length].stroke }}>
                          {c.city}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-slate-500">Cohort Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {Object.keys(comparisonData.cities[0].indicators).map((indKey) => {
                    const firstCityInd = comparisonData.cities[0].indicators[indKey];
                    const values = comparisonData.cities.map((c) => c.indicators[indKey]?.normalized ?? 0);
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;

                    return (
                      <tr key={indKey} className="hover:bg-slate-50/70">
                        <td className="px-4 py-2.5 font-medium text-slate-900">
                          {firstCityInd.display_name}
                        </td>
                        <td className="px-4 py-2.5 capitalize text-slate-500">
                          {firstCityInd.dimension.replace("_", " ")}
                        </td>
                        {comparisonData.cities.map((c) => {
                          const ind = c.indicators[indKey];
                          const score = ind?.normalized ?? 0;
                          return (
                            <td key={c.city} className="px-4 py-2.5 text-right tabular-nums">
                              <span className="font-semibold text-slate-800">{score.toFixed(1)}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {formatRawValue(ind.raw, ind.unit)}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-2.5 text-right tabular-nums text-slate-500 font-semibold">
                          {avg.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
