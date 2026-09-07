import React, { useState, useEffect } from "react";
import { cpiService } from "../services/cpiService";
import { CityCPIResponse, UnifiedPredictionData, IndicatorValues } from "../types";
import { DimensionCard } from "../components/DimensionCard";
import { IndicatorProgressBar } from "../components/IndicatorProgressBar";
import { PM25TimeSeriesChart } from "../components/PM25TimeSeriesChart";
import { AIInsightsWidget } from "../components/AIInsightsWidget";
import { SHAPFeatureImportance } from "../components/SHAPFeatureImportance";
import { RadarChartCPI } from "../components/RadarChartCPI";
import { formatNumber, getCPITier } from "../utils/formatters";
import { 
  Building2, 
  ArrowLeft, 
  MapPin, 
  Users, 
  Layers, 
  Award, 
  Leaf, 
  RefreshCw,
  Sliders
} from "lucide-react";

interface CityDetailProps {
  cityId: number;
  onBack: () => void;
  onNavigateCity: (id: number) => void;
}

export const CityDetail: React.FC<CityDetailProps> = ({
  cityId,
  onBack,
  onNavigateCity,
}) => {
  const [cityCPI, setCityCPI] = useState<CityCPIResponse | null>(null);
  const [predictionData, setPredictionData] = useState<UnifiedPredictionData | null>(null);
  const [allCities, setAllCities] = useState<{ city_id: number; city: string }[]>([]);
  const [selectedDimensionFilter, setSelectedDimensionFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCityData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cpi, pred, cities] = await Promise.all([
          cpiService.getCityCPI(cityId),
          cpiService.getCityPredictions(cityId),
          cpiService.getCities(),
        ]);

        setCityCPI(cpi);
        setPredictionData(pred);
        setAllCities(cities.map((c) => ({ city_id: c.city_id, city: c.city })));
      } catch (err: any) {
        setError(err.message || "Failed to load city details.");
      } finally {
        setLoading(false);
      }
    };

    loadCityData();
  }, [cityId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">
          Loading comprehensive analytical indicator profile...
        </p>
      </div>
    );
  }

  if (error || !cityCPI) {
    return (
      <div className="analytical-card p-8 rounded-xl max-w-lg mx-auto my-12 text-center">
        <h3 className="text-base font-bold text-slate-900 mb-2">Error Loading City Profile</h3>
        <p className="text-xs text-slate-500 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const tier = getCPITier(cityCPI.overall_cpi);

  // Filter indicators for breakdown
  const indicatorList = Object.values(cityCPI.indicators);
  const filteredIndicators =
    selectedDimensionFilter === "all"
      ? indicatorList
      : indicatorList.filter((ind) => ind.dimension === selectedDimensionFilter);

  // Group key indicators for dimension cards
  const dimensionCardMappings = [
    {
      key: "productivity",
      score: cityCPI.dimensions.productivity,
      keys: ["workforce_participation_rate", "economic_density_score", "density"],
    },
    {
      key: "infrastructure",
      score: cityCPI.dimensions.infrastructure,
      keys: ["water_coverage_pct", "public_transport_score", "road_quality_score"],
    },
    {
      key: "quality_of_life",
      score: cityCPI.dimensions.quality_of_life,
      keys: ["literacy_rate", "health_facilities_per_100k", "crime_rate_per_100k"],
    },
    {
      key: "equity",
      score: cityCPI.dimensions.equity,
      keys: ["poverty_rate_pct", "slum_population_pct", "gender_workforce_gap_pct"],
    },
    {
      key: "environment",
      score: cityCPI.dimensions.environment,
      keys: ["pm25", "green_space_pct", "waste_collection_pct"],
    },
    {
      key: "governance",
      score: cityCPI.dimensions.governance,
      keys: ["municipal_service_score", "governance_score"],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Switch City:</span>
          <select
            value={cityId}
            onChange={(e) => onNavigateCity(Number(e.target.value))}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allCities.map((c) => (
              <option key={c.city_id} value={c.city_id}>
                {c.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main City Header Banner */}
      <div className="analytical-card rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-300 font-medium mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{cityCPI.state}, India</span>
              <span>•</span>
              <span>Coordinates: {cityCPI.latitude?.toFixed(2)}° N, {cityCPI.longitude?.toFixed(2)}° E</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {cityCPI.city}
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${tier.bgColor} ${tier.color}`}>
                {tier.label}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl">
              Comprehensive urban observatory profile calculating six-dimension prosperity,
              environmental vulnerability, and predictive infrastructure health.
            </p>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[130px]">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold block">
                CPI Score
              </span>
              <span className="text-3xl font-extrabold text-white">
                {cityCPI.overall_cpi.toFixed(1)}
              </span>
              <span className="text-[10px] text-blue-300 block font-medium">Scale: 0 - 100</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[110px]">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold block">
                National Rank
              </span>
              <span className="text-3xl font-extrabold text-amber-300">
                #{cityCPI.rank}
              </span>
              <span className="text-[10px] text-slate-300 block font-medium">of 10 cities</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[120px]">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold block">
                Population
              </span>
              <span className="text-2xl font-bold text-white">
                {formatNumber(cityCPI.population)}
              </span>
              <span className="text-[10px] text-slate-300 block font-medium">Metropolitan area</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[120px]">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold block">
                Density
              </span>
              <span className="text-2xl font-bold text-white">
                {formatNumber(cityCPI.density, 0)}
              </span>
              <span className="text-[10px] text-slate-300 block font-medium">people / km²</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic AI Insights Section */}
      <AIInsightsWidget cityName={cityCPI.city} insights={cityCPI.ai_insights} />

      {/* Section Title: Six Dimensions */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Six Dimensions of Urban Prosperity
          </h3>
          <p className="text-xs text-slate-500">
            Equal 1/6 weighted aggregation computed from 24 standardized urban development indicators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dimensionCardMappings.map((dim) => (
            <DimensionCard
              key={dim.key}
              dimensionKey={dim.key}
              score={dim.score}
              indicators={cityCPI.indicators}
              keyIndicatorNames={dim.keys}
            />
          ))}
        </div>
      </div>

      {/* Visual Analytics Row: Radar & SHAP Feature Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <RadarChartCPI
            title={`${cityCPI.city} Dimension Polygon`}
            cities={[
              {
                name: cityCPI.city,
                dimensions: cityCPI.dimensions,
                stroke: "#2563eb",
                fill: "#3b82f6",
              },
            ]}
            height={340}
          />
        </div>

        <div className="lg:col-span-7">
          {predictionData?.explainability && (
            <SHAPFeatureImportance explainability={predictionData.explainability} />
          )}
        </div>
      </div>

      {/* Environment Section & AI Time-Series Air Quality Forecast */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-teal-600" />
            Environmental Sustainability & AI Atmospheric Forecasting
          </h3>
          <p className="text-xs text-slate-500">
            Air quality particulate metrics (PM2.5, PM10, NO2), municipal green space coverage, and waste processing
          </p>
        </div>

        {/* Environmental Indicators Quick Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: "pm25", label: "PM2.5", color: "text-rose-600" },
            { key: "pm10", label: "PM10", color: "text-amber-600" },
            { key: "no2", label: "NO2", color: "text-purple-600" },
            { key: "green_space_pct", label: "Green Space", color: "text-emerald-600" },
            { key: "waste_collection_pct", label: "Waste Collection", color: "text-blue-600" },
            { key: "waste_treatment_pct", label: "Waste Treatment", color: "text-teal-600" },
          ].map((item) => {
            const ind = cityCPI.indicators[item.key];
            if (!ind) return null;
            return (
              <div key={item.key} className="analytical-card rounded-lg p-3 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  {item.label}
                </span>
                <span className={`text-base font-bold ${item.color} mt-1 block`}>
                  {ind.raw} {ind.unit || ""}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Idx: {ind.normalized.toFixed(0)}/100
                </span>
              </div>
            );
          })}
        </div>

        {/* Time-Series Forecast Chart */}
        {predictionData?.pm25_forecast && (
          <PM25TimeSeriesChart
            forecast={predictionData.pm25_forecast}
            currentPM25={cityCPI.indicators.pm25?.raw || 3.5}
          />
        )}
      </div>

      {/* Complete Indicator Breakdown Table with Horizontal Progress Bars */}
      <div className="analytical-card rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Detailed Indicator Breakdown ({filteredIndicators.length} Tracked Variables)
            </h4>
            <p className="text-xs text-slate-500">
              Granular raw values alongside normalized 0-100 index scores
            </p>
          </div>

          {/* Dimension Filter Tabs */}
          <div className="flex flex-wrap gap-1 text-xs">
            {["all", "productivity", "infrastructure", "quality_of_life", "equity", "environment", "governance"].map((dim) => (
              <button
                key={dim}
                onClick={() => setSelectedDimensionFilter(dim)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition ${
                  selectedDimensionFilter === dim
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dim === "all" ? "All Indicators" : dim.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredIndicators.map((ind) => (
            <IndicatorProgressBar key={ind.display_name} indicator={ind} />
          ))}
        </div>
      </div>
    </div>
  );
};
