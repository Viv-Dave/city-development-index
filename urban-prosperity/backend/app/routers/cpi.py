from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.city import City
from app.schemas.cpi import CityCPIResponse, CPIRankingResponse, CityComparisonResponse, CPIDimensions
from app.services.cpi_engine import compute_city_cpi, get_all_city_cpis, build_rankings_response
from app.services.insights_service import generate_urban_insights

router = APIRouter(tags=["CPI Engine"])

@router.get("/cpi/rankings", response_model=CPIRankingResponse)
def get_rankings(db: Session = Depends(get_db)):
    """
    Returns all cities ranked by overall City Prosperity Index (CPI) score,
    accompanied by cohort-level KPI averages.
    """
    return build_rankings_response(db)

@router.get("/cpi/compare", response_model=CityComparisonResponse)
def compare_cities(
    cities: str = Query(..., description="Comma-separated list of city IDs, e.g., '1,2,3'"),
    db: Session = Depends(get_db)
):
    """
    Compares 2 to 5 selected cities across all six CPI dimensions and granular indicators.
    Computes cohort averages and comparative strengths/weaknesses.
    """
    try:
        city_ids = [int(cid.strip()) for cid in cities.split(",") if cid.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid city ID format. Must be integers separated by commas.")

    if len(city_ids) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 cities for comparison.")
    if len(city_ids) > 6:
        raise HTTPException(status_code=400, detail="Comparison limited to maximum 6 cities.")

    city_cpis = get_all_city_cpis(db)
    cpi_lookup = {c.city_id: (rank, cpi, dims, ind_map) for rank, (c, cpi, dims, ind_map) in enumerate(city_cpis, start=1)}

    comparison_results: List[CityCPIResponse] = []
    for cid in city_ids:
        city = db.query(City).filter(City.city_id == cid).first()
        if not city:
            raise HTTPException(status_code=404, detail=f"City with ID {cid} not found.")

        rank, cpi, dims, ind_map = cpi_lookup[cid]
        ai_insights = generate_urban_insights(city.city, dims, ind_map)

        comparison_results.append(CityCPIResponse(
            city_id=city.city_id,
            city=city.city,
            state=city.state,
            country=city.country,
            population=city.population,
            density=city.density,
            latitude=city.latitude,
            longitude=city.longitude,
            overall_cpi=cpi,
            rank=rank,
            dimensions=dims,
            indicators=ind_map,
            ai_insights=ai_insights
        ))

    # Calculate cohort averages across selected cities
    num_selected = len(comparison_results)
    cohort_avg = {
        "overall_cpi": round(sum(c.overall_cpi for c in comparison_results) / num_selected, 2),
        "productivity": round(sum(c.dimensions.productivity for c in comparison_results) / num_selected, 2),
        "infrastructure": round(sum(c.dimensions.infrastructure for c in comparison_results) / num_selected, 2),
        "quality_of_life": round(sum(c.dimensions.quality_of_life for c in comparison_results) / num_selected, 2),
        "equity": round(sum(c.dimensions.equity for c in comparison_results) / num_selected, 2),
        "environment": round(sum(c.dimensions.environment for c in comparison_results) / num_selected, 2),
        "governance": round(sum(c.dimensions.governance for c in comparison_results) / num_selected, 2),
    }

    # Derive strengths & weaknesses relative to cohort
    strengths_weaknesses = {}
    for c in comparison_results:
        diffs = {
            "Productivity": c.dimensions.productivity - cohort_avg["productivity"],
            "Infrastructure": c.dimensions.infrastructure - cohort_avg["infrastructure"],
            "Quality of Life": c.dimensions.quality_of_life - cohort_avg["quality_of_life"],
            "Equity": c.dimensions.equity - cohort_avg["equity"],
            "Environment": c.dimensions.environment - cohort_avg["environment"],
            "Governance": c.dimensions.governance - cohort_avg["governance"],
        }
        sorted_diffs = sorted(diffs.items(), key=lambda x: x[1], reverse=True)
        strengths_weaknesses[c.city] = {
            "top_advantage": f"{sorted_diffs[0][0]} (+{sorted_diffs[0][1]:.1f} vs cohort)",
            "primary_deficit": f"{sorted_diffs[-1][0]} ({sorted_diffs[-1][1]:.1f} vs cohort)",
        }

    return CityComparisonResponse(
        cities=comparison_results,
        cohort_averages=cohort_avg,
        strengths_and_weaknesses=strengths_weaknesses
    )

@router.get("/cities/{city_id}/cpi", response_model=CityCPIResponse)
@router.get("/cpi/{city_id}", response_model=CityCPIResponse)
def get_city_cpi(city_id: int, db: Session = Depends(get_db)):
    """
    Returns six dimension scores, overall CPI score, normalized and raw indicators,
    and dynamic AI-derived insights for a single city.
    """
    city = db.query(City).filter(City.city_id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail=f"City with ID {city_id} not found.")

    city_cpis = get_all_city_cpis(db)
    found_rank = 1
    found_cpi = 0.0
    found_dims = None
    found_ind_map = {}

    for rank, (c, cpi, dims, ind_map) in enumerate(city_cpis, start=1):
        if c.city_id == city_id:
            found_rank = rank
            found_cpi = cpi
            found_dims = dims
            found_ind_map = ind_map
            break

    ai_insights = generate_urban_insights(city.city, found_dims, found_ind_map)

    return CityCPIResponse(
        city_id=city.city_id,
        city=city.city,
        state=city.state,
        country=city.country,
        population=city.population,
        density=city.density,
        latitude=city.latitude,
        longitude=city.longitude,
        overall_cpi=found_cpi,
        rank=found_rank,
        dimensions=found_dims,
        indicators=found_ind_map,
        ai_insights=ai_insights
    )
