import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { CPIRankingItem } from "../types";
import { getCPITier } from "../utils/formatters";

interface IndiaMapProps {
  cities: CPIRankingItem[];
  selectedCityId: number | null;
  onSelectCity: (cityId: number) => void;
  onNavigateCity: (cityId: number) => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({
  cities,
  selectedCityId,
  onSelectCity,
  onNavigateCity,
}) => {
  // Center roughly in Central India (Nagpur/Madhya Pradesh latitude/longitude)
  const defaultCenter: [number, number] = [21.5, 78.96];

  const getMarkerColor = (cpi: number) => {
    if (cpi >= 75) return "#059669"; // emerald
    if (cpi >= 65) return "#0d9488"; // teal
    if (cpi >= 55) return "#d97706"; // amber
    return "#e11d48"; // rose
  };

  return (
    <div className="analytical-card rounded-xl overflow-hidden p-4 flex flex-col h-[420px]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Geospatial Urban Prosperity Distribution
          </h4>
          <p className="text-xs text-slate-500">
            Marker intensity and hue reflect composite City Prosperity Index (CPI) score
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span className="text-slate-600">≥75 (High)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            <span className="text-slate-600">55-74 (Moderate)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <span className="text-slate-600">&lt;55 (Lagging)</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-slate-200">
        <MapContainer
          center={defaultCenter}
          zoom={4.5}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {cities.map((city) => {
            if (!city.latitude || !city.longitude) return null;
            const isSelected = selectedCityId === city.city_id;
            const color = getMarkerColor(city.overall_cpi);
            const tier = getCPITier(city.overall_cpi);

            return (
              <CircleMarker
                key={city.city_id}
                center={[city.latitude, city.longitude]}
                radius={isSelected ? 14 : 9}
                pathOptions={{
                  color: isSelected ? "#1d4ed8" : color,
                  fillColor: color,
                  fillOpacity: isSelected ? 0.95 : 0.75,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => onSelectCity(city.city_id),
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-800">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h5 className="font-bold text-sm text-slate-900">{city.city}</h5>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                        Rank #{city.rank}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{city.state}</div>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-extrabold text-blue-700">
                        {city.overall_cpi.toFixed(1)}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${tier.bgColor} ${tier.color} ${tier.borderColor}`}>
                        {tier.label}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigateCity(city.city_id)}
                      className="w-full text-center text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded transition-colors"
                    >
                      View City Profile →
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
