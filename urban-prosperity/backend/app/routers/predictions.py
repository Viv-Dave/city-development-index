from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.model_service import model_service
from app.schemas.ml import (
    PM25ForecastRequest,
    PM25ForecastResponse,
    RoadDamageResponse,
    ExplainabilityResponse
)

router = APIRouter(tags=["AI Predictions & ML Models"])

@router.get("/predictions/{city_id}")
def get_city_predictions(city_id: int, db: Session = Depends(get_db)):
    """
    Returns unified AI prediction portfolio for a city, including:
    - 24-hour LSTM PM2.5 air-quality forecast
    - YOLOv8 pavement/road-damage condition assessment
    - CatBoost tabular indicator estimation
    - SHAP feature attributions
    """
    results = model_service.get_city_predictions(city_id, db)
    if not results:
        raise HTTPException(status_code=404, detail=f"City with ID {city_id} not found.")
    return results

@router.post("/predictions/pm25", response_model=PM25ForecastResponse)
def predict_pm25(payload: PM25ForecastRequest, db: Session = Depends(get_db)):
    """
    Inference endpoint for LSTM air-quality forecasting.
    Accepts historical sequence or city ID.
    """
    return model_service.run_pm25_forecast(
        city_id=payload.city_id,
        historical_sequence=payload.historical_sequence,
        db=db
    )

@router.post("/models/road-damage", response_model=RoadDamageResponse)
async def predict_road_damage(
    city_id: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Inference endpoint for YOLOv8 road and pavement distress detection.
    Accepts road imagery upload or runs benchmark corridor evaluation.
    """
    image_bytes = None
    image_name = "corridor_sample.jpg"
    if file:
        image_bytes = await file.read()
        image_name = file.filename

    return model_service.run_road_damage_inference(
        image_bytes=image_bytes,
        image_name=image_name,
        city_id=city_id
    )

@router.get("/explainability/{city_id}", response_model=ExplainabilityResponse)
def get_city_explainability(city_id: int, db: Session = Depends(get_db)):
    """
    Returns SHAP feature importance attributions explaining the drivers
    and drags behind the city's indicator performance.
    """
    result = model_service.run_explainability(city_id, db)
    if not result:
        raise HTTPException(status_code=404, detail=f"City with ID {city_id} not found.")
    return result
