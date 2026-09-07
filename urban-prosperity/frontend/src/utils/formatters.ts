export function formatNumber(num: number | null | undefined, digits: number = 1): string {
  if (num === null || num === undefined || isNaN(num)) return "N/A";
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} Lakh`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toFixed(digits);
}

export function formatRawValue(val: number, unit?: string | null): string {
  if (val === null || val === undefined) return "—";
  if (unit === "%") return `${val.toFixed(1)}%`;
  if (unit === "µg/m³") return `${val.toFixed(1)} µg/m³`;
  if (unit === "per 100k") return `${val.toFixed(1)} /100k`;
  if (unit === "people/km²") return `${val.toLocaleString()} /km²`;
  return `${val.toLocaleString()}${unit ? " " + unit : ""}`;
}

export function getCPITier(score: number): { label: string; color: string; bgColor: string; borderColor: string } {
  if (score >= 75) {
    return {
      label: "Very High Prosperity",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    };
  }
  if (score >= 65) {
    return {
      label: "High Prosperity",
      color: "text-teal-700",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
    };
  }
  if (score >= 55) {
    return {
      label: "Moderate Prosperity",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    };
  }
  return {
    label: "Emerging Development",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  };
}

export const DIMENSION_THEMES: Record<string, { label: string; color: string; stroke: string; bg: string }> = {
  productivity: {
    label: "Productivity",
    color: "text-blue-600",
    stroke: "#2563eb",
    bg: "bg-blue-50",
  },
  infrastructure: {
    label: "Infrastructure Development",
    color: "text-indigo-600",
    stroke: "#4f46e5",
    bg: "bg-indigo-50",
  },
  quality_of_life: {
    label: "Quality of Life",
    color: "text-purple-600",
    stroke: "#9333ea",
    bg: "bg-purple-50",
  },
  equity: {
    label: "Equity & Social Inclusion",
    color: "text-emerald-600",
    stroke: "#059669",
    bg: "bg-emerald-50",
  },
  environment: {
    label: "Environmental Sustainability",
    color: "text-teal-600",
    stroke: "#0d9488",
    bg: "bg-teal-50",
  },
  governance: {
    label: "Governance & Legislation",
    color: "text-slate-700",
    stroke: "#475569",
    bg: "bg-slate-100",
  },
};
