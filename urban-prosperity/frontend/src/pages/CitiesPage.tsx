import React, { useState, useEffect } from "react";
import { cpiService } from "../services/cpiService";
import { CityDetail } from "../types";
import { formatNumber, getCPITier } from "../utils/formatters";
import { Building2, Search, ArrowRight, MapPin, Users, Layers, RefreshCw } from "lucide-react";

interface CitiesPageProps {
  onNavigateCity: (cityId: number) => void;
}

export const CitiesPage: React.FC<CitiesPageProps> = ({ onNavigateCity }) => {
  const [cities, setCities] = useState<CityDetail[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await cpiService.getCities();
        setCities(data);
      } catch (err) {
        console.error("Error loading cities", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  const states = Array.from(new Set(cities.map((c) => c.state)));

  const filtered = cities.filter((c) => {
    const matchSearch =
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchState = stateFilter === "all" || c.state === stateFilter;
    return matchSearch && matchState;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
            Metropolitan Catalog
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
          <Building2 className="w-7 h-7 text-blue-600" />
          Indian Metropolitan Hubs ({cities.length} Cities)
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mt-1">
          Explore individual city profiles, spatial characteristics, demographic scales, and synthesized City Prosperity Index standings.
        </p>
      </div>

      {/* Search & State Filter Controls */}
      <div className="analytical-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by city or state name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">State:</span>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading urban profiles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((city) => {
            const tier = getCPITier(city.overall_cpi || 50);

            return (
              <div
                key={city.city_id}
                onClick={() => onNavigateCity(city.city_id)}
                className="analytical-card rounded-xl p-5 hover:border-blue-400 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Rank #{city.rank || "—"}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {city.city}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{city.state}, {city.country}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-bold border ${tier.bgColor} ${tier.color} ${tier.borderColor}`}
                    >
                      {city.overall_cpi?.toFixed(1) || "—"} CPI
                    </span>
                  </div>

                  {/* Demographic metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> Population
                      </span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                        {formatNumber(city.population)}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2">
                      <span className="text-[10px] text-slate-400 font-medium block flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" /> Density
                      </span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                        {formatNumber(city.density, 0)} /km²
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Full Analysis & AI Models</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
