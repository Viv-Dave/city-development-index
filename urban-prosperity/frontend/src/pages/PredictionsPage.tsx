import React, { useState, useEffect } from "react";
import { cpiService } from "../services/cpiService";
import { PM25ForecastResponse, RoadDamageResponse, CityDetail } from "../types";
import { PM25TimeSeriesChart } from "../components/PM25TimeSeriesChart";
import { 
  Cpu, 
  Wind, 
  Camera, 
  Sliders, 
  Sparkles, 
  AlertCircle, 
  Upload, 
  CheckCircle,
  RefreshCw,
  Info
} from "lucide-react";

export const PredictionsPage: React.FC = () => {
  const [cities, setCities] = useState<CityDetail[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"lstm" | "yolo" | "catboost">("lstm");

  // LSTM State
  const [lstmForecast, setLstmForecast] = useState<PM25ForecastResponse | null>(null);
  const [lstmLoading, setLstmLoading] = useState<boolean>(false);

  // YOLO State
  const [roadDamageResult, setRoadDamageResult] = useState<RoadDamageResponse | null>(null);
  const [yoloLoading, setYoloLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // CatBoost State
  const [catboostFeatures, setCatboostFeatures] = useState({
    water_coverage_pct: 88,
    green_space_pct: 32,
    public_transport_score: 75,
    pm25: 3.8,
  });
  const [catboostResult, setCatboostResult] = useState<number | null>(null);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const cityList = await cpiService.getCities();
        setCities(cityList);
        if (cityList.length > 0) {
          triggerLSTM(cityList[0].city_id);
          triggerYOLO(cityList[0].city_id);
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

  const triggerYOLO = async (cityId?: number, file?: File | null) => {
    try {
      setYoloLoading(true);
      const formData = new FormData();
      if (cityId) formData.append("city_id", String(cityId));
      if (file) formData.append("file", file);
      const res = await cpiService.postRoadDamage(formData);
      setRoadDamageResult(res);
    } catch (err) {
      console.error("YOLO error", err);
    } finally {
      setYoloLoading(false);
    }
  };

  const computeCatboostEstimate = () => {
    const { water_coverage_pct, green_space_pct, public_transport_score, pm25 } = catboostFeatures;
    const est = 0.35 * water_coverage_pct + 0.45 * green_space_pct + 0.30 * public_transport_score - 4.2 * pm25;
    setCatboostResult(Math.max(10, Math.min(98, Number(est.toFixed(1)))));
  };

  useEffect(() => {
    computeCatboostEstimate();
  }, [catboostFeatures]);

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
          AI & Deep Learning Predictive Intelligence
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl mt-1">
          Interactive testbench for modular deep learning and statistical inference layers designed to ingest raw sensor,
          telemetry, and computer vision streams into normalized CPI indicators.
        </p>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        {[
          { id: "lstm", label: "Model 2: PyTorch LSTM (Air Quality)", icon: Wind },
          { id: "yolo", label: "Model 1: YOLOv8 (Road Damage CV)", icon: Camera },
          { id: "catboost", label: "Model 3 & 4: CatBoost + SHAP (Tabular)", icon: Sliders },
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

      {/* MODEL 2: YOLOv8 TAB */}
      {activeTab === "yolo" && (
        <div className="space-y-6">
          <div className="analytical-card rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  YOLOv8 Computer Vision Pavement & Distress Detection
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluates urban road corridor imagery to estimate pavement distress density and road quality scores
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => triggerYOLO(selectedCityId, selectedFile)}
                  disabled={yoloLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {yoloLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                  Execute YOLO Inference
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {roadDamageResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Simulated Camera Feed with Bounding Boxes */}
              <div className="lg:col-span-7 analytical-card rounded-xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    Pavement Survey Vision Sensor Feed
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {roadDamageResult.corridor_name}
                  </span>
                </div>

                {/* Simulated Road Viewport */}
                <div className="w-full h-64 bg-slate-850 rounded-xl relative overflow-hidden border border-slate-700 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 opacity-90" />
                  
                  {/* Road Asphalt lines */}
                  <div className="absolute inset-x-0 bottom-0 h-48 border-t border-dashed border-slate-600 flex justify-center">
                    <div className="w-1 h-full bg-amber-400/50"></div>
                  </div>

                  {/* Render Bounding Boxes */}
                  {roadDamageResult.detections.map((det, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-rose-500 bg-rose-500/20 rounded text-[10px] text-rose-200 font-mono p-0.5 flex flex-col justify-between"
                      style={{
                        left: `${det.x_min * 100}%`,
                        top: `${det.y_min * 100}%`,
                        width: `${(det.x_max - det.x_min) * 100}%`,
                        height: `${(det.y_max - det.y_min) * 100}%`,
                      }}
                    >
                      <span className="bg-rose-600 text-white px-1 py-0.2 rounded self-start uppercase font-bold text-[9px]">
                        {det.damage_type} ({(det.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}

                  <span className="relative z-10 text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md border border-slate-700">
                    CV Distress Detections: {roadDamageResult.total_detections} active anomalies flagged
                  </span>
                </div>
              </div>

              {/* Inferred Indicators */}
              <div className="lg:col-span-5 analytical-card rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Pavement Health Metrics Derived
                </h4>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Distress Density:</span>
                    <span className="text-sm font-bold text-slate-900">
                      {roadDamageResult.damage_density_per_sqm} / 100m²
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Estimated Road Quality:</span>
                    <span className="text-base font-extrabold text-blue-700">
                      {roadDamageResult.estimated_road_quality_score} / 100
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Inference Engine:</span>
                    <span className="text-[11px] text-slate-500">
                      {roadDamageResult.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-2">
                  <p>
                    <strong>Benchmark:</strong> RDD-India (Road Damage Dataset) taxonomy distinguishing potholes, longitudinal cracks, and alligator cracking.
                  </p>
                  <p>
                    <strong>Downstream Feed:</strong> Seamlessly feeds into the <span className="font-semibold text-slate-700">road_quality_score</span> indicator under Infrastructure.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODEL 3 & 4: CATBOOST + SHAP TAB */}
      {activeTab === "catboost" && (
        <div className="space-y-6">
          <div className="analytical-card rounded-xl p-5">
            <h3 className="text-base font-bold text-slate-900">
              Interactive CatBoost Tabular Imputation & Feature Attribution
            </h3>
            <p className="text-xs text-slate-500">
              Adjust municipal variables to simulate non-linear estimation of Quality of Life and observe immediate Shapley sensitivity
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Water Coverage: {catboostFeatures.water_coverage_pct}%
                </label>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={catboostFeatures.water_coverage_pct}
                  onChange={(e) =>
                    setCatboostFeatures({ ...catboostFeatures, water_coverage_pct: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Green Space: {catboostFeatures.green_space_pct}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={catboostFeatures.green_space_pct}
                  onChange={(e) =>
                    setCatboostFeatures({ ...catboostFeatures, green_space_pct: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Transit Score: {catboostFeatures.public_transport_score}
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={catboostFeatures.public_transport_score}
                  onChange={(e) =>
                    setCatboostFeatures({ ...catboostFeatures, public_transport_score: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  PM2.5 Ambient: {catboostFeatures.pm25} µg/m³
                </label>
                <input
                  type="range"
                  min="1.5"
                  max="8.0"
                  step="0.1"
                  value={catboostFeatures.pm25}
                  onChange={(e) =>
                    setCatboostFeatures({ ...catboostFeatures, pm25: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-700 font-semibold block uppercase tracking-wider">
                  CatBoost Imputed Quality of Life Index
                </span>
                <span className="text-2xl font-extrabold text-purple-900">
                  {catboostResult} / 100
                </span>
              </div>
              <span className="text-xs text-purple-700 bg-white px-3 py-1 rounded border border-purple-200 font-medium">
                Simulated Gradient Boosted Decision Trees
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
