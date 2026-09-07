from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.city import City
from app.schemas.city import CityRead, CityDetail
from app.services.cpi_engine import get_all_city_cpis, compute_city_cpi

router = APIRouter(prefix="/cities", tags=["Cities"])

@router.get("", response_model=List[CityDetail])
def get_cities(db: Session = Depends(get_db)):
    """
    Returns all registered cities along with their overall CPI score and ranking.
    """
    city_cpis = get_all_city_cpis(db)
    response = []
    for rank, (city, cpi, _, _) in enumerate(city_cpis, start=1):
        response.append(CityDetail(
            city_id=city.city_id,
            city=city.city,
            state=city.state,
            country=city.country,
            population=city.population,
            density=city.density,
            latitude=city.latitude,
            longitude=city.longitude,
            overall_cpi=cpi,
            rank=rank
        ))
    return response

@router.get("/{city_id}", response_model=CityDetail)
def get_city(city_id: int, db: Session = Depends(get_db)):
    """
    Returns complete raw city information for a specific city.
    """
    city = db.query(City).filter(City.city_id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail=f"City with ID {city_id} not found.")

    city_cpis = get_all_city_cpis(db)
    found_rank = None
    found_cpi = None
    for rank, (c, cpi, _, _) in enumerate(city_cpis, start=1):
        if c.city_id == city_id:
            found_rank = rank
            found_cpi = cpi
            break

    return CityDetail(
        city_id=city.city_id,
        city=city.city,
        state=city.state,
        country=city.country,
        population=city.population,
        density=city.density,
        latitude=city.latitude,
        longitude=city.longitude,
        overall_cpi=found_cpi,
        rank=found_rank
    )
