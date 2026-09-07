from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PM25ForecastPoint(BaseModel):
    hour: int
    timestamp: str
    predicted_pm25: float
    lower_bound: float
    upper_bound: float
    confidence: float

class PM25ForecastRequest(BaseModel):
    city_id: Optional[int] = None
    city_name: Optional[str] = None
    historical_sequence: Optional[List[float]] = Field(
        None, description="24-hour historical PM2.5 sequence. If omitted, uses stored city data."
    )

class PM25ForecastResponse(BaseModel):
    city_id: Optional[int]
    city: str
    current_pm25: float
    unit: str = "µg/m³"
    forecast_24h: List[PM25ForecastPoint]
    model_type: str
    status: str
    inference_source: str = "LSTM Air Quality Model (PyTorch Architecture)"

class RoadDamageBox(BaseModel):
    x_min: float
    y_min: float
    x_max: float
    y_max: float
    confidence: float
    damage_type: str  # e.g., 'transverse_crack', 'longitudinal_crack', 'pothole'

class RoadDamageResponse(BaseModel):
    city_id: Optional[int] = None
    corridor_name: Optional[str] = "Primary Urban Arterial Corridor"
    total_detections: int
    detections: List[RoadDamageBox]
    damage_density_per_sqm: float
    estimated_road_quality_score: float
    status: str
    model_type: str = "YOLOv8n Road Damage (RDD-India Benchmark)"

class SHAPFeatureContribution(BaseModel):
    feature: str
    display_name: str
    shap_value: float
    raw_value: float
    dimension: str
    direction: str
    impact_type: str  # "positive_driver" or "negative_drag"

class ExplainabilityResponse(BaseModel):
    city_id: int
    city: str
    target_metric: str
    base_value: float
    predicted_value: float
    features: List[SHAPFeatureContribution]
    summary: str
    model_used: str = "CatBoostRegressor + SHAP TreeExplainer"
