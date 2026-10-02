from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.model_service import model_service
from app.schemas.ml import (
    PM25ForecastRequest,
    PM25ForecastResponse,
    ExplainabilityResponse,
    QolPredictRequest,
    QolPredictResponse,
    QolSHAPEntry,
)

router = APIRouter(tags=["AI Predictions & ML Models"])

@router.get("/predictions/{city_id}")
def get_city_predictions(city_id: int, db: Session = Depends(get_db)):
    """
    Returns unified AI prediction portfolio for a city, including:
    - 24-hour LSTM PM2.5 air-quality forecast
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

@router.post("/predictions/qol/predict", response_model=QolPredictResponse)
def predict_qol(payload: QolPredictRequest, db: Session = Depends(get_db)):
    """
    Interactive QoL prediction endpoint for the dashboard.
    Accepts city name + optional override values for the four dashboard controls.
    Builds a full 25-feature vector (model_metadata.json order), runs the saved
    CatBoost model, computes SHAP attributions via TreeExplainer, and returns
    the predicted Quality of Life Index with feature-level SHAP breakdown.
    """
    from app.models.city import City
    from app.models.indicator import CityIndicator
    from app.ml.catboost.service import indicator_estimator
    from app.ml.explainability.service import explainer_service
    import numpy as np

    # 1. Resolve city
    city_rec = db.query(City).filter(City.city == payload.city).first()
    if not city_rec:
        raise HTTPException(status_code=404, detail=f"City '{payload.city}' not found.")

    # 2. Build DB indicator map
    ind_map: dict = {ind.indicator_name: ind.value for ind in city_rec.indicators}

    # Map DB column names → model feature names where they differ
    DB_TO_MODEL = {
        "public_transport_score": "public_transit_score",
        "health_facilities_per_100k": "healthcare_facilities_per_100k",
        "slum_population_pct": "informal_settlement_pct",
        "population_2011": "population",
        "density_per_km2": "population_density",
    }
    # Also include city-level fields from the City row
    ind_map.setdefault("population_2011", city_rec.population)
    ind_map.setdefault("density_per_km2", city_rec.density)

    # 3. Translate DB names to model feature names
    model_features: dict = {}
    for db_name, val in ind_map.items():
        model_key = DB_TO_MODEL.get(db_name, db_name)
        model_features[model_key] = val

    # 4. Apply overrides
    # Override keys come from the dashboard (use DB names, translate to model names)
    for override_key, override_val in (payload.overrides or {}).items():
        model_key = DB_TO_MODEL.get(override_key, override_key)
        model_features[model_key] = override_val

    # 5. Set year (not in DB indicators)
    model_features["year"] = float(payload.year or 2024)

    # 6. Build ordered feature vector per model_metadata.json
    if not indicator_estimator.is_loaded:
        raise HTTPException(status_code=503, detail="CatBoost model not loaded.")

    feature_names = indicator_estimator.features
    vec = [model_features.get(f, 0.0) for f in feature_names]

    # 7. Run CatBoost prediction
    pred_val = indicator_estimator.predict_from_vector(vec)

    # 8. Run SHAP
    explainer_service._init_explainer()
    if explainer_service.explainer is None:
        raise HTTPException(status_code=503, detail="SHAP explainer not ready.")

    import pandas as pd
    X = pd.DataFrame([vec], columns=feature_names)
    shap_out = explainer_service.explainer(X)
    shap_vals = shap_out.values[0]
    base_val = float(shap_out.base_values[0])

    # 9. Build SHAP entries (all features)
    all_shap: list[QolSHAPEntry] = []
    for feat, sv, rv in zip(feature_names, shap_vals, vec):
        sv_f = float(sv)
        all_shap.append(QolSHAPEntry(
            feature=feat,
            raw_value=round(float(rv), 4),
            shap_value=round(sv_f, 4),
            direction="positive" if sv_f >= 0 else "negative",
        ))

    top_positive = sorted(
        [s for s in all_shap if s.shap_value >= 0],
        key=lambda x: x.shap_value, reverse=True
    )[:5]
    top_negative = sorted(
        [s for s in all_shap if s.shap_value < 0],
        key=lambda x: x.shap_value
    )[:5]

    return QolPredictResponse(
        quality_of_life_index=round(float(pred_val), 2),
        base_value=round(base_val, 2),
        shap=all_shap,
        top_positive=top_positive,
        top_negative=top_negative,
    )
