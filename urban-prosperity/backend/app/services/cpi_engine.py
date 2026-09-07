from typing import Dict, List, Optional, Tuple, Any
import numpy as np
from sqlalchemy.orm import Session

from app.config import DIMENSION_CONFIG, INDICATOR_METADATA, settings
from app.models.city import City
from app.models.indicator import CityIndicator
from app.schemas.cpi import CPIDimensions, IndicatorValues, CityCPIResponse, CPIRankingItem, CPIRankingResponse

def compute_city_cpi(city: City, indicators: List[CityIndicator]) -> Tuple[float, CPIDimensions, Dict[str, IndicatorValues]]:
    """
    Computes the 6 CPI dimensions and overall equal-weighted CPI score for a city.
    Ensures dimension scores and overall score are bounded strictly between 0 and 100.
    """
    indicator_dict: Dict[str, CityIndicator] = {ind.indicator_name: ind for ind in indicators}
    dimension_scores: Dict[str, float] = {}

    for dim, ind_names in DIMENSION_CONFIG.items():
        scores = []
        for name in ind_names:
            if name in indicator_dict and indicator_dict[name].normalized_value is not None:
                scores.append(indicator_dict[name].normalized_value)
            elif hasattr(city, name):
                # Fallback to city table column if applicable (e.g. population, density)
                pass
        
        if scores:
            dim_score = float(np.mean(scores))
        else:
            dim_score = 50.0  # neutral fallback
            
        dimension_scores[dim] = round(float(np.clip(dim_score, 0.0, 100.0)), 2)

    cpi_dimensions = CPIDimensions(
        productivity=dimension_scores["productivity"],
        infrastructure=dimension_scores["infrastructure"],
        quality_of_life=dimension_scores["quality_of_life"],
        equity=dimension_scores["equity"],
        environment=dimension_scores["environment"],
        governance=dimension_scores["governance"],
    )

    # CPI is average of the 6 dimension scores (equal 1/6 weight)
    dim_values = [
        cpi_dimensions.productivity,
        cpi_dimensions.infrastructure,
        cpi_dimensions.quality_of_life,
        cpi_dimensions.equity,
        cpi_dimensions.environment,
        cpi_dimensions.governance
    ]
    overall_cpi = round(float(np.clip(np.mean(dim_values), 0.0, 100.0)), 2)

    # Prepare detailed indicator map
    indicators_map: Dict[str, IndicatorValues] = {}
    for ind in indicators:
        meta = INDICATOR_METADATA.get(ind.indicator_name, {})
        indicators_map[ind.indicator_name] = IndicatorValues(
            raw=ind.value,
            normalized=round(ind.normalized_value or 0.0, 2),
            unit=ind.unit or meta.get("unit"),
            direction=ind.direction or meta.get("direction", "positive"),
            dimension=ind.dimension or meta.get("dimension", "productivity"),
            display_name=meta.get("display_name", ind.indicator_name.replace("_", " ").title())
        )

    return overall_cpi, cpi_dimensions, indicators_map


def get_all_city_cpis(db: Session) -> List[Tuple[City, float, CPIDimensions, Dict[str, IndicatorValues]]]:
    """
    Computes CPI scores for all cities in the database, returned in descending order of CPI.
    """
    cities = db.query(City).all()
    results = []
    for city in cities:
        cpi, dims, ind_map = compute_city_cpi(city, city.indicators)
        results.append((city, cpi, dims, ind_map))

    # Sort descending by CPI
    results.sort(key=lambda x: x[1], reverse=True)
    return results


def build_rankings_response(db: Session) -> CPIRankingResponse:
    """
    Builds the national ranking summary for the main dashboard.
    """
    city_cpis = get_all_city_cpis(db)
    if not city_cpis:
        return CPIRankingResponse(
            total_cities=0,
            national_average_cpi=0.0,
            highest_cpi_city="None",
            lowest_cpi_city="None",
            environment_average=0.0,
            rankings=[]
        )

    rankings: List[CPIRankingItem] = []
    total_cpi = 0.0
    total_env = 0.0

    for rank, (city, cpi, dims, _) in enumerate(city_cpis, start=1):
        rankings.append(CPIRankingItem(
            rank=rank,
            city_id=city.city_id,
            city=city.city,
            state=city.state,
            overall_cpi=cpi,
            dimensions=dims,
            population=city.population,
            density=city.density,
            latitude=city.latitude,
            longitude=city.longitude
        ))
        total_cpi += cpi
        total_env += dims.environment

    count = len(city_cpis)
    return CPIRankingResponse(
        total_cities=count,
        national_average_cpi=round(total_cpi / count, 2),
        highest_cpi_city=city_cpis[0][0].city,
        lowest_cpi_city=city_cpis[-1][0].city,
        environment_average=round(total_env / count, 2),
        rankings=rankings
    )
