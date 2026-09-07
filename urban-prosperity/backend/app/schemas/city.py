from typing import Optional
from pydantic import BaseModel, ConfigDict

class CityBase(BaseModel):
    city: str
    state: str
    country: str = "India"
    population: float
    density: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CityCreate(CityBase):
    city_id: int

class CityRead(CityBase):
    city_id: int
    model_config = ConfigDict(from_attributes=True)

class CityDetail(CityRead):
    overall_cpi: Optional[float] = None
    rank: Optional[int] = None
