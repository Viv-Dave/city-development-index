import React from "react";
import { 
  Building2, 
  BarChart3, 
  GitCompare, 
  Cpu, 
  Database, 
  BookOpen, 
  MapPin, 
  Activity 
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "cities", label: "Cities", icon: Building2 },
    { id: "compare", label: "Compare Cities", icon: GitCompare },
    { id: "predictions", label: "AI Predictions", icon: Cpu },
    { id: "indicators", label: "Data / Indicators", icon: Database },
    { id: "methodology", label: "Methodology", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => onTabChange("dashboard")}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-teal-400 flex items-center justify-center shadow-inner">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Urban Prosperity Intelligence
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  India CPI
                </span>
              </div>
              <div className="text-xs text-slate-400">
                City Prosperity Index & Geospatial Analytics
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Status Pill */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>10 Cities Loaded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-800 space-x-2 bg-slate-950">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`whitespace-nowrap px-3 py-1 rounded text-xs font-medium ${
              currentTab === item.id ? "bg-blue-600 text-white" : "text-slate-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
