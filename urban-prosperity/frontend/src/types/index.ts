export interface CPIDimensions {
  productivity: number;
  infrastructure: number;
  quality_of_life: number;
  equity: number;
  environment: number;
  governance: number;
}

export interface IndicatorValues {
  raw: number;
  normalized: number;
  unit: string | null;
  direction: "positive" | "negative";
  dimension: string;
  display_name: string;
}

export interface CityDetail {
  city_id: number;
  city: string;
  state: string;
  country: string;
  population: number;
  density: number;
  latitude: number | null;
  longitude: number | null;
  overall_cpi: number | null;
  rank: number | null;
}

export interface CityCPIResponse {
  city_id: number;
  city: string;
  state: string;
  country: string;
  population: number;
  density: number;
  latitude: number | null;
  longitude: number | null;
  overall_cpi: number;
  rank: number;
  dimensions: CPIDimensions;
  indicators: Record<string, IndicatorValues>;
  ai_insights: string[];
}

export interface CPIRankingItem {
  rank: number;
  city_id: number;
  city: string;
  state: string;
  overall_cpi: number;
  dimensions: CPIDimensions;
  population: number;
  density: number;
  latitude: number | null;
  longitude: number | null;
}

export interface CPIRankingResponse {
  total_cities: number;
  national_average_cpi: number;
  highest_cpi_city: string;
  lowest_cpi_city: string;
  environment_average: number;
  rankings: CPIRankingItem[];
}

export interface CityComparisonResponse {
  cities: CityCPIResponse[];
  cohort_averages: Record<string, number>;
  strengths_and_weaknesses: Record<
    string,
    {
      top_advantage: string;
      primary_deficit: string;
    }
  >;
}

export interface IndicatorMetadata {
  name: string;
  display_name: string;
  dimension: string;
  direction: "positive" | "negative";
  unit: string;
  description: string;
  min_value: number | null;
  max_value: number | null;
  mean_value: number | null;
}

export interface IndicatorRead {
  id: number;
  city_id: number;
  indicator_name: string;
  value: number;
  normalized_value: number | null;
  unit: string | null;
  dimension: string;
  direction: "positive" | "negative";
  display_name: string;
  description: string;
}

export interface CityIndicatorsResponse {
  city_id: number;
  city: string;
  total_indicators: number;
  indicators: IndicatorRead[];
}

export interface PM25ForecastPoint {
  hour: number;
  timestamp: string;
  predicted_pm25: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

export interface PM25ForecastResponse {
  city_id: number | null;
  city: string;
  current_pm25: number;
  unit: string;
  forecast_24h: PM25ForecastPoint[];
  model_type: string;
  status: string;
  inference_source: string;
}

export interface RoadDamageBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
  confidence: number;
  damage_type: string;
}

export interface RoadDamageResponse {
  city_id: number | null;
  corridor_name: string;
  total_detections: number;
  detections: RoadDamageBox[];
  damage_density_per_sqm: number;
  estimated_road_quality_score: number;
  status: string;
  model_type: string;
}

export interface SHAPFeatureContribution {
  feature: string;
  display_name: string;
  shap_value: number;
  raw_value: number;
  dimension: string;
  direction: string;
  impact_type: "positive_driver" | "negative_drag";
}

export interface ExplainabilityResponse {
  city_id: number;
  city: string;
  target_metric: string;
  base_value: number;
  predicted_value: number;
  features: SHAPFeatureContribution[];
  summary: string;
  model_used: string;
}

export interface UnifiedPredictionData {
  city_id: number;
  city: string;
  state: string;
  pm25_forecast: PM25ForecastResponse;
  road_damage_assessment: RoadDamageResponse;
  estimated_target_indicator: {
    metric_name: string;
    estimated_value: number;
    model: string;
  };
  explainability: ExplainabilityResponse;
}
