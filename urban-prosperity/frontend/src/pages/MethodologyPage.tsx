import React from "react";
import { 
  BookOpen, 
  ArrowDown, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Cpu, 
  Scale, 
  Activity, 
  Sparkles,
  ExternalLink
} from "lucide-react";

export const MethodologyPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            Technical Whitepaper & Framework
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-blue-600" />
          City Prosperity Index (CPI) Calculation Methodology
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl mt-1">
          Architectural foundation, mathematical formulations, non-linear normalizations, and multi-source AI measurement pipelines
          customized for the Indian urban ecosystem.
        </p>
      </div>

      {/* Synthetic Data Alert Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="block font-bold mb-0.5">Important Notice on Baseline Data:</strong>
          The current demonstration uses synthetic indicator values for development. Real-world deployment requires validated Indian government and open datasets (CPCB, NFHS, NCRB, ISRO Bhuvan, PLFS, Smart Cities Mission). Do not represent these demonstration scores as official government statistics.
        </div>
      </div>

      {/* Visual Pipeline Section */}
      <div className="analytical-card rounded-xl p-6">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          End-to-End Urban Intelligence Pipeline
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          CPI is strictly an aggregated statistical index derived from normalized indicators—it is <strong>never</strong> directly predicted as a monolithic black-box score by an ML model.
        </p>

        {/* Vertical Pipeline Flowchart */}
        <div className="space-y-3">
          {[
            {
              step: "STEP 1",
              title: "RAW DATA INGESTION",
              desc: "Ingestion of civic municipal data, air quality monitors, vision feeds, road surveys, and demographic censuses.",
              icon: Database,
              color: "bg-blue-600 text-white",
            },
            {
              step: "STEP 2",
              title: "AI / STATISTICAL MEASUREMENT MODELS",
              desc: "Deep LSTM air quality forecasting, YOLOv8 pavement distress analysis, and CatBoost missing-value estimation.",
              icon: Cpu,
              color: "bg-purple-600 text-white",
            },
            {
              step: "STEP 3",
              title: "24 STANDARDIZED INDICATORS",
              desc: "Mapped to physical units (µg/m³, %, /100k, scores) across 6 urban prosperity dimensions.",
              icon: Layers,
              color: "bg-indigo-600 text-white",
            },
            {
              step: "STEP 4",
              title: "MIN-MAX NORMALIZATION & CLAMPING",
              desc: "Directional mapping of positive and negative indicators to standard 0-100 performance scale with max==min division safety.",
              icon: Scale,
              color: "bg-teal-600 text-white",
            },
            {
              step: "STEP 5",
              title: "SIX CPI DIMENSION SCORES",
              desc: "Arithmetic mean calculated independently across the normalized indicators in each dimension.",
              icon: Activity,
              color: "bg-emerald-600 text-white",
            },
            {
              step: "STEP 6",
              title: "OVERALL CPI SYNTHESIS",
              desc: "Equal 1/6 aggregation across Productivity, Infrastructure, Quality of Life, Equity, Environment, and Governance.",
              icon: CheckCircle2,
              color: "bg-slate-900 text-white",
            },
            {
              step: "STEP 7",
              title: "AI URBAN INSIGHTS & EXPLAINABILITY",
              desc: "Dynamic rule synthesis and SHAP Shapley value attributions explaining positive drivers and negative drags.",
              icon: Sparkles,
              color: "bg-amber-600 text-white",
            },
          ].map((node, i, arr) => {
            const Icon = node.icon;
            return (
              <React.Fragment key={node.step}>
                <div className="flex items-start gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className={`p-2 rounded-lg ${node.color} shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {node.step}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{node.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{node.desc}</p>
                  </div>
                </div>

                {i < arr.length - 1 && (
                  <div className="flex justify-center my-1 text-slate-300">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Normalization Formulas */}
      <div className="analytical-card rounded-xl p-6">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Mathematical Formulation: Normalization Engine
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          To ensure equitable comparability across disparate units (e.g. population density vs microgram particulate concentration), all indicators undergo Min-Max linear transformation to a [0, 100] interval.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-700 block uppercase tracking-wider">
              1. Positive Indicator (Higher is Better)
            </span>
            <p className="text-slate-600">
              Applies to literacy, water coverage, public transport, green space, road quality, and governance:
            </p>
            <div className="p-3 rounded bg-white font-mono text-slate-900 border border-slate-200">
              X_norm = 100 * (X - min(X)) / (max(X) - min(X))
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-rose-700 block uppercase tracking-wider">
              2. Negative Indicator (Lower is Better)
            </span>
            <p className="text-slate-600">
              Applies to crime rate, PM2.5, PM10, NO2, poverty rate, slum population, and gender workforce gap:
            </p>
            <div className="p-3 rounded bg-white font-mono text-slate-900 border border-slate-200">
              X_norm = 100 * (1 - (X - min(X)) / (max(X) - min(X)))
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-800">
          <strong>Degenerate Case Handling:</strong> In cases where all cities share identical values (max == min), the engine safely returns a neutral median value of <strong>50.0</strong> to avoid division by zero.
        </div>
      </div>

      {/* CPI Dimension Aggregation Formula */}
      <div className="analytical-card rounded-xl p-6">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Overall City Prosperity Index (CPI) Equation
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Each dimension score represents the unweighted arithmetic mean of its constituent normalized indicators. The overall CPI score is the equal 1/6 weighted combination of the 6 dimensions:
        </p>

        <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs sm:text-sm text-center leading-relaxed">
          CPI = (Productivity + Infrastructure + Quality_of_Life + Equity + Environmental_Sustainability + Governance) / 6
        </div>
      </div>

      {/* Future Indian Government Dataset Integration Registry */}
      <div className="analytical-card rounded-xl p-6">
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Future Indian Open Data & Government System Compatibility
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          The database and service architectures are decoupled to facilitate hot-swapping synthetic data with official Indian government data feeds:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            {
              source: "CPCB (Central Pollution Control Board)",
              type: "CAAQMS Continuous Ambient Air Quality Monitors",
              feeds: "pm25, pm10, no2 hourly telemetry",
            },
            {
              source: "RDD-India / RDD2020",
              type: "Pavement Distress Computer Vision Benchmark",
              feeds: "road_quality_score, damage density via YOLOv8",
            },
            {
              source: "Bhuvan / ISRO National Remote Sensing Centre",
              type: "Geospatial Urban Satellite & LULC Imagery",
              feeds: "green_space_pct, urban built-up density",
            },
            {
              source: "Smart Cities Mission & AMRUT",
              type: "MoHUA Municipal Data Portal",
              feeds: "water_coverage_pct, sewerage_coverage_pct, waste_treatment_pct",
            },
            {
              source: "NFHS (National Family Health Survey)",
              type: "MoHFW Public Health Registry",
              feeds: "health_facilities_per_100k, maternal/child indices",
            },
            {
              source: "NCRB (National Crime Records Bureau)",
              type: "Crime in India Annual Statistics",
              feeds: "crime_rate_per_100k (IPC cognizable offenses)",
            },
            {
              source: "PLFS (Periodic Labour Force Survey)",
              type: "MoSPI Employment Bulletins",
              feeds: "workforce_participation_rate, gender_workforce_gap_pct",
            },
            {
              source: "EoLI / MPI (Ease of Living & Multidimensional Poverty)",
              type: "NITI Aayog National Benchmarks",
              feeds: "poverty_rate_pct, validation calibration targets",
            },
          ].map((item) => (
            <div key={item.source} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900">{item.source}</div>
              <div className="text-[11px] text-blue-700 font-medium">{item.type}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                <strong>Ingestion Target:</strong> {item.feeds}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
