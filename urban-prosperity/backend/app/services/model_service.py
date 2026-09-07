from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.city import City
from app.models.indicator import CityIndicator
from app.ml.lstm.service import pm25_predictor
from app.ml.yolo.service import road_damage_model
from app.ml.catboost.service import indicator_estimator
from app.ml.explainability.service import explainer_service
from app.schemas.ml import PM25ForecastResponse, RoadDamageResponse, ExplainabilityResponse

class ModelService:
    @staticmethod
    def get_city_predictions(city_id: int, db: Session) -> Dict:
        city = db.query(City).filter(City.city_id == city_id).first()
        if not city:
            return None

        # Fetch city indicators
        indicators_map = {ind.indicator_name: ind.value for ind in city.indicators}
        pm25_val = indicators_map.get("pm25", 3.5)

        # 1. Forecast PM2.5
        pm25_forecast = pm25_predictor.predict_24h_forecast(
            base_pm25=pm25_val,
            city_name=city.city,
            city_id=city.city_id
        )

        # 2. Road damage estimation
        road_damage = road_damage_model.predict(
            image_name=f"{city.city.lower()}_primary_corridor.jpg",
            city_id=city.city_id
        )

        # 3. Tabular estimation
        estimated_indicator = indicator_estimator.predict(indicators_map)

        # 4. SHAP explainability
        shap_explanation = explainer_service.explain(
            features=indicators_map,
            city_id=city.city_id,
            city_name=city.city
        )

        return {
            "city_id": city.city_id,
            "city": city.city,
            "state": city.state,
            "pm25_forecast": pm25_forecast,
            "road_damage_assessment": road_damage,
            "estimated_target_indicator": {
                "metric_name": "Quality of Life Synthesized Index",
                "estimated_value": round(estimated_indicator, 2),
                "model": "CatBoostRegressor (Tabular Imputation)"
            },
            "explainability": shap_explanation
        }

    @staticmethod
    def run_pm25_forecast(
        city_id: Optional[int],
        historical_sequence: Optional[List[float]],
        db: Session
    ) -> PM25ForecastResponse:
        city_name = "Cohort Simulation"
        base_pm25 = 3.5

        if city_id:
            city = db.query(City).filter(City.city_id == city_id).first()
            if city:
                city_name = city.city
                ind = db.query(CityIndicator).filter(
                    CityIndicator.city_id == city_id,
                    CityIndicator.indicator_name == "pm25"
                ).first()
                if ind:
                    base_pm25 = ind.value

        if historical_sequence and len(historical_sequence) > 0:
            base_pm25 = historical_sequence[-1]

        return pm25_predictor.predict_24h_forecast(
            base_pm25=base_pm25,
            city_name=city_name,
            city_id=city_id
        )

    @staticmethod
    def run_road_damage_inference(
        image_bytes: Optional[bytes],
        image_name: Optional[str],
        city_id: Optional[int]
    ) -> RoadDamageResponse:
        return road_damage_model.predict(
            image_bytes=image_bytes,
            image_name=image_name,
            city_id=city_id
        )

    @staticmethod
    def run_explainability(city_id: int, db: Session) -> Optional[ExplainabilityResponse]:
        city = db.query(City).filter(City.city_id == city_id).first()
        if not city:
            return None

        indicators_map = {ind.indicator_name: ind.value for ind in city.indicators}
        return explainer_service.explain(
            features=indicators_map,
            city_id=city.city_id,
            city_name=city.city
        )

model_service = ModelService()
