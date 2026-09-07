import { apiClient } from "./api";
import {
  CityDetail,
  CityCPIResponse,
  CPIRankingResponse,
  CityComparisonResponse,
  CityIndicatorsResponse,
  IndicatorMetadata,
  IndicatorRead,
  UnifiedPredictionData,
  PM25ForecastResponse,
  RoadDamageResponse,
  ExplainabilityResponse,
} from "../types";

export const cpiService = {
  async getHealth() {
    const res = await apiClient.get("/health");
    return res.data;
  },

  async getCities(): Promise<CityDetail[]> {
    const res = await apiClient.get<CityDetail[]>("/cities");
    return res.data;
  },

  async getCity(cityId: number): Promise<CityDetail> {
    const res = await apiClient.get<CityDetail>(`/cities/${cityId}`);
    return res.data;
  },

  async getCityCPI(cityId: number): Promise<CityCPIResponse> {
    const res = await apiClient.get<CityCPIResponse>(`/cities/${cityId}/cpi`);
    return res.data;
  },

  async getRankings(): Promise<CPIRankingResponse> {
    const res = await apiClient.get<CPIRankingResponse>("/cpi/rankings");
    return res.data;
  },

  async compareCities(cityIds: number[]): Promise<CityComparisonResponse> {
    const res = await apiClient.get<CityComparisonResponse>(
      `/cpi/compare?cities=${cityIds.join(",")}`
    );
    return res.data;
  },

  async getCityIndicators(cityId: number): Promise<CityIndicatorsResponse> {
    const res = await apiClient.get<CityIndicatorsResponse>(`/indicators/${cityId}`);
    return res.data;
  },

  async getSpecificIndicator(cityId: number, indicatorName: string): Promise<IndicatorRead> {
    const res = await apiClient.get<IndicatorRead>(`/indicators/${cityId}/${indicatorName}`);
    return res.data;
  },

  async getIndicatorsMetadata(): Promise<IndicatorMetadata[]> {
    const res = await apiClient.get<IndicatorMetadata[]>("/indicators/meta/summary");
    return res.data;
  },

  async getCityPredictions(cityId: number): Promise<UnifiedPredictionData> {
    const res = await apiClient.get<UnifiedPredictionData>(`/predictions/${cityId}`);
    return res.data;
  },

  async postPM25Forecast(data: { city_id?: number; historical_sequence?: number[] }): Promise<PM25ForecastResponse> {
    const res = await apiClient.post<PM25ForecastResponse>("/predictions/pm25", data);
    return res.data;
  },

  async postRoadDamage(formData: FormData): Promise<RoadDamageResponse> {
    const res = await apiClient.post<RoadDamageResponse>("/models/road-damage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async getExplainability(cityId: number): Promise<ExplainabilityResponse> {
    const res = await apiClient.get<ExplainabilityResponse>(`/explainability/${cityId}`);
    return res.data;
  },
};
