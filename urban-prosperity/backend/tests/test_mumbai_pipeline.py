import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models.city import City
from app.models.indicator import CityIndicator
from app.services.data_loader import load_and_seed_data
from app.services.cpi_engine import compute_city_cpi
from app.config import INDICATOR_CONFIG, DIMENSION_CONFIG

@pytest.fixture(scope="module")
def seeded_db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()

    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "cpi_india_research_dataset.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "cpi_india_research_dataset.csv")

    load_and_seed_data(db, csv_path=csv_path)
    yield db
    db.close()

def test_mumbai_indicator_pipeline_audit(seeded_db):
    """
    Audits and validates the indicator normalization pipeline for Mumbai.
    Prints min, max, raw value, and normalized score for every indicator for Mumbai.
    Verifies that non-minimum values are strictly > 0.
    """
    mumbai = seeded_db.query(City).filter(City.city == "Mumbai").first()
    assert mumbai is not None, "Mumbai city record must exist in database"

    # Fetch cohort-wide min and max for all indicators
    all_indicators = seeded_db.query(CityIndicator).all()
    grouped_vals = {}
    for ind in all_indicators:
        if ind.indicator_name not in grouped_vals:
            grouped_vals[ind.indicator_name] = []
        grouped_vals[ind.indicator_name].append(ind.value)

    mumbai_inds = {ind.indicator_name: ind for ind in mumbai.indicators}

    print("\n" + "=" * 90)
    print(f"{'INDICATOR':<30} | {'RAW':<8} | {'MIN':<8} | {'MAX':<8} | {'DIR':<10} | {'NORM /100':<10} | {'STATUS'}")
    print("=" * 90)

    checked_indicators = 0
    zero_indicators = []

    for ind_name, cfg in INDICATOR_CONFIG.items():
        if ind_name not in mumbai_inds:
            continue

        ind = mumbai_inds[ind_name]
        raw_val = ind.value
        norm_val = ind.normalized_value
        direction = cfg["direction"]
        cohort_vals = grouped_vals.get(ind_name, [raw_val])
        min_v = min(cohort_vals)
        max_v = max(cohort_vals)

        checked_indicators += 1

        if norm_val is not None:
            norm_str = f"{norm_val:.2f}"
            if norm_val == 0.0:
                zero_indicators.append(ind_name)
                status = "ZERO (Cohort Min)" if (direction == "positive" and raw_val == min_v) or (direction == "negative" and raw_val == max_v) else "INCORRECT ZERO"
            else:
                status = "VALID (>0)"
        else:
            norm_str = "N/A (Context)"
            status = "CONTEXTUAL"

        print(f"{ind_name:<30} | {raw_val:<8.2f} | {min_v:<8.2f} | {max_v:<8.2f} | {direction:<10} | {norm_str:<10} | {status}")

    print("=" * 90)

    # Compute CPI for Mumbai
    overall_cpi, dims, ind_map = compute_city_cpi(mumbai, mumbai.indicators)
    print(f"\nMumbai Overall CPI: {overall_cpi:.2f}/100")
    print(f"Productivity Dimension:   {dims.productivity:.2f}")
    print(f"Infrastructure Dimension: {dims.infrastructure:.2f}")
    print(f"Quality of Life:          {dims.quality_of_life:.2f}")
    print(f"Equity & Inclusion:       {dims.equity:.2f}")
    print(f"Environment:              {dims.environment:.2f}")
    print(f"Governance:               {dims.governance:.2f}")

    # Specific Verification Assertions for Mumbai's non-minimum values:
    # 1. Literacy rate (Mumbai = 89.73, cohort min = 82.26) MUST NOT be 0
    assert mumbai_inds["literacy_rate"].normalized_value > 90.0, "Mumbai literacy must be > 90/100"

    # 2. Economic density score (Mumbai = 78, cohort min = 73) MUST NOT be 0
    assert mumbai_inds["economic_density_score"].normalized_value > 20.0, "Mumbai economic density must be > 20/100"

    # 3. Water coverage (Mumbai = 94, cohort min = 90) MUST NOT be 0
    assert mumbai_inds["water_coverage_pct"].normalized_value > 50.0, "Mumbai water coverage must be > 50/100"

    # 4. Sewerage coverage (Mumbai = 88, cohort min = 82) MUST NOT be 0
    assert mumbai_inds["sewerage_coverage_pct"].normalized_value > 40.0, "Mumbai sewerage coverage must be > 40/100"

    # 5. Road quality score (Mumbai = 72, cohort min = 67) MUST NOT be 0
    assert mumbai_inds["road_quality_score"].normalized_value > 15.0, "Mumbai road quality must be > 15/100"

    # 6. Internet access (Mumbai = 86, cohort min = 80) MUST NOT be 0
    assert mumbai_inds["internet_access_pct"].normalized_value > 40.0, "Mumbai internet access must be > 40/100"

    # 7. PM2.5 (Mumbai = 45.0, cohort max = 110.0, lower is better) MUST NOT be 0
    assert mumbai_inds["pm25_ug_m3"].normalized_value > 50.0, "Mumbai PM2.5 normalized score must be > 50/100"

    # 8. PM10 (Mumbai = 115.0, cohort max = 210.0, lower is better) MUST NOT be 0
    assert mumbai_inds["pm10_ug_m3"].normalized_value > 40.0, "Mumbai PM10 normalized score must be > 40/100"

    # 9. NO2 (Mumbai = 32.0, cohort max = 52.0, lower is better) MUST NOT be 0
    assert mumbai_inds["no2_ug_m3"].normalized_value > 30.0, "Mumbai NO2 normalized score must be > 30/100"

    # 10. Only public_transport_score is a legitimate 0.0 because Mumbai's score of 78 is the cohort minimum (78-86 range)
    for z in zero_indicators:
        assert z == "public_transport_score", f"Unexpected zero normalized indicator found for Mumbai: {z}"

    # Verify contextual variables do not participate in dimension scores
    assert "population_2011" not in DIMENSION_CONFIG["productivity"]
    assert "density_per_km2" not in DIMENSION_CONFIG["productivity"]

    # Verify overall CPI and all dimensions are in [0, 100]
    assert 0.0 <= overall_cpi <= 100.0
    for dim_score in [dims.productivity, dims.infrastructure, dims.quality_of_life, dims.equity, dims.environment, dims.governance]:
        assert 0.0 <= dim_score <= 100.0
