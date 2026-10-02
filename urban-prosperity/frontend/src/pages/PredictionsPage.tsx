import React, { useState, useEffect, useCallback } from "react";
import { cpiService } from "../services/cpiService";
import { PM25ForecastResponse, CityDetail, QolPredictResponse } from "../types";
import { PM25TimeSeriesChart } from "../components/PM25TimeSeriesChart";
import {
  Cpu,
  Wind,
  Sliders,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export const PredictionsPage: React.FC = () => {
  const [cities, setCities] = useState<CityDetail[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"lstm" | "catboost">("lstm");

  // LSTM State
  const [lstmForecast, setLstmForecast] = useState<PM25ForecastResponse | null>(null);
  const [lstmLoading, setLstmLoading] = useState<boolean>(false);

  // CatBoost State
  const [catboostCityName, setCatboostCityName] = useState<string>("Mumbai");
  const [catboostFeatures, setCatboostFeatures] = useState({
    water_coverage_pct: 88,
    green_space_pct: 32,
    public_transit_score: 75,
    pm25_ug_m3: 3.8,
  });
  const [catboostResult, setCatboostResult] = useState<QolPredictResponse | null>(null);
  const [catboostLoading, setCatboostLoading] = useState<boolean>(false);
  const [catboostError, setCatboostError] = useState<string | null>(null);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const cityList = await cpiService.getCities();
        setCities(cityList);
        if (cityList.length > 0) {
          triggerLSTM(cityList[0].city_id);
          setCatboostCityName(cityList[0].city);
        }
      } catch (err) {
        console.error("Init predictions error", err);
      }
    };
    loadInit();
  }, []);

  const triggerLSTM = async (cityId: number) => {
    try {
      setLstmLoading(true);
      const res = await cpiService.postPM25Forecast({ city_id: cityId });
      setLstmForecast(res);
    } catch (err) {
      console.error("LSTM error", err);
    } finally {
      setLstmLoading(false);
    }
  };

  const runCatboostPredict = useCallback(
    async (cityName: string, features: typeof catboostFeatures) => {
      try {
        setCatboostLoading(true);
        setCatboostError(null);
        const res = await cpiService.postQolPredict({
          city: cityName,
          year: 2024,
          overrides: {
            water_coverage_pct: features.water_coverage_pct,
            green_space_pct: features.green_space_pct,
            public_transit_score: features.public_transit_score,
            pm25_ug_m3: features.pm25_ug_m3,
          },
        });
        setCatboostResult(res);
      } catch (err: any) {
        setCatboostError(err?.response?.data?.detail ?? "Prediction failed.");
        console.error("CatBoost error", err);
      } finally {
        setCatboostLoading(false);
      }
    },
    []
  );

  // Debounce: only fire after the user stops moving the slider for 400 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      runCatboostPredict(catboostCityName, catboostFeatures);
    }, 400);
    return () => clearTimeout(timer);
  }, [catboostFeatures, catboostCityName, runCatboostPredict]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
            Machine Learning Subsystems
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
          <Cpu className="w-7 h-7 text-purple-600" />
          AI &amp; Deep Learning Predictive Intelligence
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl mt-1">
          Interactive testbench for modular deep learning and statistical inference layers designed to ingest raw sensor,
          telemetry, and computer vision streams into normalized CPI indicators.
        </p>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        {[
          { id: "lstm", label: "Model 1: PyTorch LSTM (Air Quality)", icon: Wind },
          { id: "catboost", label: "Model 2: CatBoost + SHAP (Tabular)", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
                isActive
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MODEL 1: LSTM TAB */}
      {activeTab === "lstm" && (
        <div className="space-y-6">
          <div className="analytical-card rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  LSTM Ambient PM2.5 Time-Series Forward Forecasting
                </h3>
                <p className="text-xs text-slate-500">
                  Select an urban centre to synthesize next 24-hour hourly aerosol dispersion curve
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedCityId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedCityId(id);
                    triggerLSTM(id);
                  }}
                  className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2"
                >
                  {cities.map((c) => (
                    <option key={c.city_id} value={c.city_id}>
                      {c.city}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => triggerLSTM(selectedCityId)}
                  disabled={lstmLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {lstmLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Run LSTM Inference
                </button>
              </div>
            </div>
          </div>

          {lstmForecast && (
            <PM25TimeSeriesChart
              forecast={lstmForecast}
              currentPM25={lstmForecast.current_pm25}
            />
          )}

          {/* Model Specification Card */}
          <div className="analytical-card rounded-xl p-5 bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
              Deep Learning Model Specification: LSTM
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <strong className="text-slate-800 block">Architecture</strong>
                <code className="text-[11px] text-purple-700 block mt-1 bg-white p-2 rounded border border-slate-200">
                  Input(24) → LSTM(64) → Dropout(0.2) → LSTM(32) → Dense(16) → Dense(1)
                </code>
              </div>
              <div>
                <strong className="text-slate-800 block">Atmospheric Signals</strong>
                <p className="text-slate-600 mt-1">
                  Ingests rolling 24-step PM2.5 sequences, integrating diurnal convective dispersion and nocturnal thermal boundary trapping.
                </p>
              </div>
              <div>
                <strong className="text-slate-800 block">Target Future Integration</strong>
                <p className="text-slate-600 mt-1">
                  CPCB (Central Pollution Control Board) continuous ambient air quality monitoring stations (CAAQMS) API stream.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODEL 2: CATBOOST + SHAP TAB */}
      {activeTab === "catboost" && (
        <div className="space-y-6">
          <div className="analytical-card rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Interactive CatBoost Tabular Imputation &amp; Feature Attribution
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust municipal variables to observe real-time Shapley attribution from the trained CatBoost model
                </p>
              </div>
              <select
                value={catboostCityName}
                onChange={(e) => setCatboostCityName(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2"
              >
                {cities.map((c) => (
                  <option key={c.city_id} value={c.city}>{c.city}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Water Coverage: {catboostFeatures.water_coverage_pct}%
                </label>
                <input
                  type="range" min="60" max="100"
                  value={catboostFeatures.water_coverage_pct}
                  onChange={(e) => setCatboostFeatures({ ...catboostFeatures, water_coverage_pct: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Green Space: {catboostFeatures.green_space_pct}%
                </label>
                <input
                  type="range" min="10" max="50"
                  value={catboostFeatures.green_space_pct}
                  onChange={(e) => setCatboostFeatures({ ...catboostFeatures, green_space_pct: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Transit Score: {catboostFeatures.public_transit_score}
                </label>
                <input
                  type="range" min="50" max="95"
                  value={catboostFeatures.public_transit_score}
                  onChange={(e) => setCatboostFeatures({ ...catboostFeatures, public_transit_score: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  PM2.5 Ambient: {catboostFeatures.pm25_ug_m3} µg/m³
                </label>
                <input
                  type="range" min="1.5" max="120" step="0.5"
                  value={catboostFeatures.pm25_ug_m3}
                  onChange={(e) => setCatboostFeatures({ ...catboostFeatures, pm25_ug_m3: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            {/* QoL result */}
            <div className="mt-5 p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-700 font-semibold block uppercase tracking-wider">
                  CatBoost Imputed Quality of Life Index
                </span>
                <span className="text-2xl font-extrabold text-purple-900">
                  {catboostLoading
                    ? <RefreshCw className="w-5 h-5 animate-spin inline text-purple-500" />
                    : catboostResult
                      ? `${catboostResult.quality_of_life_index} / 100`
                      : "—"}
                </span>
                {catboostResult && (
                  <span className="text-[11px] text-purple-500 block mt-0.5">
                    SHAP base value: {catboostResult.base_value.toFixed(2)}
                  </span>
                )}
              </div>
              <span className="text-xs text-purple-700 bg-white px-3 py-1 rounded border border-purple-200 font-medium">
                CatBoostRegressor + SHAP TreeExplainer
              </span>
            </div>

            {catboostError && (
              <p className="mt-2 text-xs text-rose-600 font-medium">{catboostError}</p>
            )}
          </div>

          {/* SHAP contributors */}
          {catboostResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="analytical-card rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  Top Positive Attributions
                </h4>
                <div className="space-y-2">
                  {catboostResult.top_positive.map((s) => (
                    <div key={s.feature} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate mr-2">
                        {s.feature.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400">raw: {s.raw_value.toFixed(1)}</span>
                        <span className="font-mono font-bold text-emerald-600">+{s.shap_value.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="analytical-card rounded-xl p-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  Top Negative Attributions
                </h4>
                <div className="space-y-2">
                  {catboostResult.top_negative.map((s) => (
                    <div key={s.feature} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate mr-2">
                        {s.feature.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400">raw: {s.raw_value.toFixed(1)}</span>
                        <span className="font-mono font-bold text-rose-600">{s.shap_value.toFixed(3)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
