from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

class CPIDimensions(BaseModel):
    productivity: float = Field(..., ge=0, le=100, description="Productivity Dimension Score (0-100)")
    infrastructure: float = Field(..., ge=0, le=100, description="Infrastructure Dimension Score (0-100)")
    quality_of_life: float = Field(..., ge=0, le=100, description="Quality of Life Dimension Score (0-100)")
    equity: float = Field(..., ge=0, le=100, description="Equity and Inclusion Score (0-100)")
    environment: float = Field(..., ge=0, le=100, description="Environmental Sustainability Score (0-100)")
    governance: float = Field(..., ge=0, le=100, description="Governance Dimension Score (0-100)")

class IndicatorValues(BaseModel):
    raw: float
    normalized: float
    unit: Optional[str] = None
    direction: str
    dimension: str
    display_name: str

class CityCPIResponse(BaseModel):
    city_id: int
    city: str
    state: str
    country: str = "India"
    population: float
    density: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    overall_cpi: float = Field(..., ge=0, le=100)
    rank: int
    dimensions: CPIDimensions
    indicators: Dict[str, IndicatorValues]
    ai_insights: List[str] = []

class CPIRankingItem(BaseModel):
    rank: int
    city_id: int
    city: str
    state: str
    overall_cpi: float
    dimensions: CPIDimensions
    population: float
    density: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CPIRankingResponse(BaseModel):
    total_cities: int
    national_average_cpi: float
    highest_cpi_city: str
    lowest_cpi_city: str
    environment_average: float
    rankings: List[CPIRankingItem]

class CityComparisonResponse(BaseModel):
    cities: List[CityCPIResponse]
    cohort_averages: Dict[str, float]
    strengths_and_weaknesses: Dict[str, Dict[str, Any]]
