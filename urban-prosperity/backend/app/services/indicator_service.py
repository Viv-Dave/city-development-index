from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.config import INDICATOR_METADATA
from app.models.city import City
from app.models.indicator import CityIndicator
from app.schemas.indicator import IndicatorRead, IndicatorMetadataSchema, CityIndicatorsResponse

def get_city_indicators(db: Session, city_id: int) -> Optional[CityIndicatorsResponse]:
    city = db.query(City).filter(City.city_id == city_id).first()
    if not city:
        return None

    results = []
    for ind in city.indicators:
        meta = INDICATOR_METADATA.get(ind.indicator_name, {})
        results.append(IndicatorRead(
            id=ind.id,
            city_id=ind.city_id,
            indicator_name=ind.indicator_name,
            value=ind.value,
            normalized_value=ind.normalized_value,
            unit=ind.unit,
            dimension=ind.dimension,
            direction=ind.direction,
            display_name=meta.get("display_name", ind.indicator_name.replace("_", " ").title()),
            description=meta.get("description", "")
        ))

    # Sort indicators by dimension and name
    results.sort(key=lambda x: (x.dimension, x.indicator_name))

    return CityIndicatorsResponse(
        city_id=city.city_id,
        city=city.city,
        total_indicators=len(results),
        indicators=results
    )


def get_city_indicator_by_name(db: Session, city_id: int, indicator_name: str) -> Optional[IndicatorRead]:
    ind = db.query(CityIndicator).filter(
        CityIndicator.city_id == city_id,
        CityIndicator.indicator_name == indicator_name
    ).first()
    if not ind:
        return None

    meta = INDICATOR_METADATA.get(ind.indicator_name, {})
    return IndicatorRead(
        id=ind.id,
        city_id=ind.city_id,
        indicator_name=ind.indicator_name,
        value=ind.value,
        normalized_value=ind.normalized_value,
        unit=ind.unit,
        dimension=ind.dimension,
        direction=ind.direction,
        display_name=meta.get("display_name", ind.indicator_name.replace("_", " ").title()),
        description=meta.get("description", "")
    )


def get_indicators_summary(db: Session) -> List[IndicatorMetadataSchema]:
    """
    Returns metadata and statistical summary (min, max, mean) for all tracked indicators.
    """
    all_indicators = db.query(CityIndicator).all()
    grouped: Dict[str, List[float]] = {}
    for ind in all_indicators:
        if ind.indicator_name not in grouped:
            grouped[ind.indicator_name] = []
        grouped[ind.indicator_name].append(ind.value)

    summary: List[IndicatorMetadataSchema] = []
    for name, meta in INDICATOR_METADATA.items():
        vals = grouped.get(name, [])
        min_v = min(vals) if vals else None
        max_v = max(vals) if vals else None
        mean_v = sum(vals) / len(vals) if vals else None

        summary.append(IndicatorMetadataSchema(
            name=name,
            display_name=meta["display_name"],
            dimension=meta["dimension"],
            direction=meta["direction"],
            unit=meta["unit"],
            description=meta["description"],
            min_value=round(min_v, 2) if min_v is not None else None,
            max_value=round(max_v, 2) if max_v is not None else None,
            mean_value=round(mean_v, 2) if mean_v is not None else None,
        ))

    return summary
