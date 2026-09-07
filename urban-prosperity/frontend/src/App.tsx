import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { CitiesPage } from "./pages/CitiesPage";
import { CityDetail } from "./pages/CityDetail";
import { CompareCities } from "./pages/CompareCities";
import { PredictionsPage } from "./pages/PredictionsPage";
import { IndicatorsPage } from "./pages/IndicatorsPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { ShieldCheck, Database, Cpu } from "lucide-react";

export function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [selectedCityId, setSelectedCityId] = useState<number>(1);

  const handleNavigateCity = (cityId: number) => {
    setSelectedCityId(cityId);
    setCurrentTab("city_detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateCompare = () => {
    setCurrentTab("compare");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === "dashboard" && (
          <Dashboard
            onNavigateCity={handleNavigateCity}
            onNavigateCompare={handleNavigateCompare}
          />
        )}

        {currentTab === "cities" && (
          <CitiesPage onNavigateCity={handleNavigateCity} />
        )}

        {currentTab === "city_detail" && (
          <CityDetail
            cityId={selectedCityId}
            onBack={() => setCurrentTab("dashboard")}
            onNavigateCity={handleNavigateCity}
          />
        )}

        {currentTab === "compare" && <CompareCities />}

        {currentTab === "predictions" && <PredictionsPage />}

        {currentTab === "indicators" && <IndicatorsPage />}

        {currentTab === "methodology" && <MethodologyPage />}
      </main>

      {/* Research & Production Grade Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-white font-bold text-sm tracking-tight flex items-center gap-2">
              Urban Prosperity Intelligence Platform
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600/30 text-blue-400 border border-blue-500/40 uppercase font-semibold">
                v1.0 Production Prototype
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1 max-w-md">
              India-specific multi-dimensional City Prosperity Index framework synthesizing Productivity,
              Infrastructure, Quality of Life, Equity, Environment, and Governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-400" /> Decoupled Data Layer
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" /> Modular ML Pipeline
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Normalized Indicators
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Demonstration environment initialized with synthetic city development datasets. Designed for future integration with CPCB, ISRO Bhuvan, NFHS, NCRB, and MoHUA Smart Cities Mission.
          </p>
          <p className="font-mono">
            FastAPI + React + Vite + TypeScript + Tailwind
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
