from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.indicator import IndicatorRead, CityIndicatorsResponse, IndicatorMetadataSchema
from app.services.indicator_service import (
    get_city_indicators,
    get_city_indicator_by_name,
    get_indicators_summary
)

router = APIRouter(prefix="/indicators", tags=["Indicators"])

@router.get("/meta/summary", response_model=List[IndicatorMetadataSchema])
def get_metadata_summary(db: Session = Depends(get_db)):
    """
    Returns metadata definitions and cohort statistics (min, max, mean) for all tracked indicators.
    """
    return get_indicators_summary(db)

@router.get("/{city_id}", response_model=CityIndicatorsResponse)
def get_indicators_for_city(city_id: int, db: Session = Depends(get_db)):
    """
    Returns all raw and normalized indicators for a given city.
    """
    response = get_city_indicators(db, city_id)
    if not response:
        raise HTTPException(status_code=404, detail=f"City with ID {city_id} not found.")
    return response

@router.get("/{city_id}/{indicator_name}", response_model=IndicatorRead)
def get_specific_indicator(city_id: int, indicator_name: str, db: Session = Depends(get_db)):
    """
    Returns a specific indicator's raw and normalized value for a given city.
    """
    indicator = get_city_indicator_by_name(db, city_id, indicator_name)
    if not indicator:
        raise HTTPException(
            status_code=404,
            detail=f"Indicator '{indicator_name}' for city ID {city_id} not found."
        )
    return indicator
