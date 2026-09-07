import pytest
from app.models.city import City
from app.models.indicator import CityIndicator
from app.services.cpi_engine import compute_city_cpi
from app.config import DIMENSION_CONFIG

def create_mock_indicators(city_id: int, normalized_val: float):
    indicators = []
    for dim, ind_names in DIMENSION_CONFIG.items():
        for name in ind_names:
            indicators.append(CityIndicator(
                city_id=city_id,
                indicator_name=name,
                value=50.0,
                normalized_value=normalized_val,
                unit="%",
                dimension=dim,
                direction="positive"
            ))
    return indicators

def test_cpi_bounds_and_dimensions():
    city = City(
        city_id=1,
        city="TestCity",
        state="TestState",
        population=1000000,
        density=5000
    )
    indicators = create_mock_indicators(city_id=1, normalized_val=75.0)
    cpi, dims, ind_map = compute_city_cpi(city, indicators)

    assert 0.0 <= cpi <= 100.0
    assert cpi == 75.0
    assert dims.productivity == 75.0
    assert dims.infrastructure == 75.0
    assert dims.quality_of_life == 75.0
    assert dims.equity == 75.0
    assert dims.environment == 75.0
    assert dims.governance == 75.0

def test_cpi_extreme_bounds():
    city = City(city_id=2, city="MinCity", state="State", population=1000, density=100)
    # Worst case: all 0.0
    min_inds = create_mock_indicators(city_id=2, normalized_val=0.0)
    cpi_min, dims_min, _ = compute_city_cpi(city, min_inds)
    assert cpi_min == 0.0
    assert dims_min.productivity == 0.0

    # Best case: all 100.0
    max_inds = create_mock_indicators(city_id=2, normalized_val=100.0)
    cpi_max, dims_max, _ = compute_city_cpi(city, max_inds)
    assert cpi_max == 100.0
    assert dims_max.productivity == 100.0

def test_equal_weighting_averaging():
    city = City(city_id=3, city="WeightedCity", state="State", population=500000, density=2000)
    # Set different scores for each dimension
    dimension_scores = {
        "productivity": 90.0,
        "infrastructure": 80.0,
        "quality_of_life": 70.0,
        "equity": 60.0,
        "environment": 50.0,
        "governance": 40.0,
    }
    indicators = []
    for dim, score in dimension_scores.items():
        for name in DIMENSION_CONFIG[dim]:
            indicators.append(CityIndicator(
                city_id=3,
                indicator_name=name,
                value=score,
                normalized_value=score,
                unit="score",
                dimension=dim,
                direction="positive"
            ))

    cpi, dims, _ = compute_city_cpi(city, indicators)
    expected_cpi = (90 + 80 + 70 + 60 + 50 + 40) / 6.0
    assert pytest.approx(cpi, 0.01) == expected_cpi
    assert dims.productivity == 90.0
    assert dims.governance == 40.0
