import React, { useState, useEffect } from "react";
import { cpiService } from "../services/cpiService";
import { CPIRankingResponse, CityCPIResponse } from "../types";
import { StatCard } from "../components/StatCard";
import { CPIRankingTable } from "../components/CPIRankingTable";
import { RadarChartCPI } from "../components/RadarChartCPI";
import { IndiaMap } from "../components/IndiaMap";
import { 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  BarChart, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DashboardProps {
  onNavigateCity: (cityId: number) => void;
  onNavigateCompare: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateCity,
  onNavigateCompare,
}) => {
  const [rankingsData, setRankingsData] = useState<CPIRankingResponse | null>(null);
  const [selectedCityCPI, setSelectedCityCPI] = useState<CityCPIResponse | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const rankings = await cpiService.getRankings();
      setRankingsData(rankings);

      // Select the #1 ranked city by default or keep previous selection
      const initialId = rankings.rankings[0]?.city_id || 1;
      setSelectedCityId(initialId);

      const cityCPI = await cpiService.getCityCPI(initialId);
      setSelectedCityCPI(cityCPI);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSelectCity = async (cityId: number) => {
    setSelectedCityId(cityId);
    try {
      const cityCPI = await cpiService.getCityCPI(cityId);
      setSelectedCityCPI(cityCPI);
    } catch (err) {
      console.error("Failed to load selected city details", err);
    }
  };

  if (loading && !rankingsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Synthesizing multi-dimensional CPI indices across Indian cities...
        </p>
      </div>
    );
  }

  if (error || !rankingsData) {
    return (
      <div className="analytical-card p-8 rounded-xl max-w-lg mx-auto my-12 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          !
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">Service Connection Error</h3>
        <p className="text-xs text-slate-500 mb-4">{error || "Unable to reach FastAPI backend"}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Prepare Bar chart data for CPI comparison
  const barChartData = rankingsData.rankings.map((r) => ({
    name: r.city,
    city_id: r.city_id,
    cpi: r.overall_cpi,
  }));

  const getBarColor = (cityId: number) => {
    if (cityId === selectedCityId) return "#2563eb";
    return "#94a3b8";
  };

  return (
    <div className="space-y-8">
      {/* Platform Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                National Urban Observatory
              </span>
              <span className="text-xs text-slate-400">• Synthetic Benchmarks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              India Urban Prosperity Index
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl mt-1">
              AI-assisted measurement of urban prosperity across Indian cities synthesized across six fundamental dimensions:
              Productivity, Infrastructure, Quality of Life, Equity, Environmental Sustainability, and Governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateCompare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
            >
              Compare Cities
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 Headline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Average CPI"
          value={`${rankingsData.national_average_cpi.toFixed(1)}`}
          subtitle="National cohort mean (0–100)"
          icon={BarChart}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          badge="Cohort Mean"
        />

        <StatCard
          title="Highest CPI City"
          value={rankingsData.highest_cpi_city}
          subtitle={`Top Rank (#1 in Index)`}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          badge="Frontrunner"
          badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200"
        />

        <StatCard
          title="Lowest CPI City"
          value={rankingsData.lowest_cpi_city}
          subtitle="High growth opportunity zone"
          icon={TrendingDown}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          badge="Development Focus"
          badgeColor="bg-amber-50 text-amber-700 border-amber-200"
        />

        <StatCard
          title="Cities Analyzed"
          value={rankingsData.total_cities}
          subtitle="Tier-1 & Tier-2 Indian hubs"
          icon={Building}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          badge="100% Ingested"
        />

        <StatCard
          title="Environmental Average"
          value={`${rankingsData.environment_average.toFixed(1)}`}
          subtitle="Cohort sustainability score"
          icon={Leaf}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          badge="Air / Waste / Green"
          badgeColor="bg-teal-50 text-teal-700 border-teal-200"
        />
      </div>

      {/* Main Ranking Table */}
      <CPIRankingTable
        rankings={rankingsData.rankings}
        selectedCityId={selectedCityId}
        onSelectCity={handleSelectCity}
        onNavigateCity={onNavigateCity}
      />

      {/* Visual Analytics Row: CPI Comparison Bar Chart & Selected City Radar Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CPI Bar Chart (7 cols) */}
        <div className="lg:col-span-7 analytical-card rounded-xl p-5 flex flex-col justify-between">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Cross-City CPI Performance Comparison
              </h4>
              <p className="text-xs text-slate-500">
                Equal-weighted composite scores. Click any bar or table row to inspect dimension profile.
              </p>
            </div>
            <span className="text-xs text-blue-600 font-medium">
              Selected: {selectedCityCPI?.city || "City"}
            </span>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.5rem",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${Number(val).toFixed(1)} / 100`, "CPI Score"]}
                />
                <Bar
                  dataKey="cpi"
                  radius={[4, 4, 0, 0]}
                  onClick={(entry: any) => handleSelectCity(entry.city_id)}
                  cursor="pointer"
                >
                  {barChartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.city_id}`}
                      fill={getBarColor(entry.city_id)}
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6-Dimension Radar Chart for Selected City (5 cols) */}
        <div className="lg:col-span-5">
          {selectedCityCPI ? (
            <div className="h-full flex flex-col justify-between">
              <RadarChartCPI
                title={`${selectedCityCPI.city} — Six-Dimension Prosperity Radar`}
                cities={[
                  {
                    name: selectedCityCPI.city,
                    dimensions: selectedCityCPI.dimensions,
                    stroke: "#2563eb",
                    fill: "#3b82f6",
                  },
                ]}
                height={280}
              />
              <div className="mt-3 text-center">
                <button
                  onClick={() => onNavigateCity(selectedCityCPI.city_id)}
                  className="w-full py-2 px-4 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition border border-blue-200"
                >
                  Explore Complete Indicator Breakdown for {selectedCityCPI.city} →
                </button>
              </div>
            </div>
          ) : (
            <div className="analytical-card rounded-xl p-8 flex items-center justify-center text-slate-400 text-xs">
              Select a city to render radar chart
            </div>
          )}
        </div>
      </div>

      {/* Geospatial Map Section */}
      <div>
        <IndiaMap
          cities={rankingsData.rankings}
          selectedCityId={selectedCityId}
          onSelectCity={handleSelectCity}
          onNavigateCity={onNavigateCity}
        />
      </div>
    </div>
  );
};
