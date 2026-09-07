from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class IndicatorBase(BaseModel):
    indicator_name: str
    value: float
    normalized_value: Optional[float] = None
    unit: Optional[str] = None
    dimension: str
    direction: str  # "positive" or "negative"

class IndicatorRead(IndicatorBase):
    id: int
    city_id: int
    display_name: Optional[str] = None
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class IndicatorMetadataSchema(BaseModel):
    name: str
    display_name: str
    dimension: str
    direction: str
    unit: str
    description: str
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    mean_value: Optional[float] = None

class CityIndicatorsResponse(BaseModel):
    city_id: int
    city: str
    total_indicators: int
    indicators: List[IndicatorRead]
