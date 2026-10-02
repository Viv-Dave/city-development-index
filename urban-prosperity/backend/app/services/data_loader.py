import os
import logging
from typing import Dict, List, Optional
import pandas as pd
from sqlalchemy.orm import Session

from app.config import settings, DIMENSION_CONFIG, INDICATOR_CONFIG, CITY_COORDINATES
from app.models.city import City
from app.models.indicator import CityIndicator
from app.services.normalization import normalize_indicator, normalize_value

logger = logging.getLogger("urban_prosperity.data_loader")

REQUIRED_CITY_COLS = ["city", "state"]

# Indicator key aliases mapping shorthand names to primary CSV columns
INDICATOR_ALIASES = {
    "pm25": "pm25_ug_m3",
    "pm10": "pm10_ug_m3",
    "no2": "no2_ug_m3",
    "population": "population_2011",
    "density": "density_per_km2",
}

def load_and_seed_data(db: Session, csv_path: Optional[str] = None) -> int:
    """
    Reads cpi_india_research_dataset.csv, validates columns,
    computes min/max normalization, and seeds database cleanly.
    """
    if not csv_path:
        candidates = [
            settings.CSV_DATA_PATH,
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "cpi_india_research_dataset.csv"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "cpi_india_research_dataset.csv"),
            "cpi_india_research_dataset.csv",
            "data/cpi_india_research_dataset.csv",
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "cities.csv"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "cities.csv"),
            "cities.csv",
            "data/cities.csv"
        ]
        for p in candidates:
            if p and os.path.exists(p):
                csv_path = p
                break

    if not csv_path or not os.path.exists(csv_path):
        logger.error(f"Dataset not found. Checked: {candidates}")
        raise FileNotFoundError("City research dataset not found. Please provide a valid CSV path.")

    logger.info(f"Ingesting city dataset from {csv_path}")
    df = pd.read_csv(csv_path)

    for col in REQUIRED_CITY_COLS:
        if col not in df.columns:
            raise ValueError(f"Required column '{col}' missing from dataset.")

    # Assign city_id if absent
    if "city_id" not in df.columns:
        df["city_id"] = range(1, len(df) + 1)

    # Convert numeric columns
    non_numeric = ["city", "state", "dataset_note", "source_year", "data_status"]
    for col in df.columns:
        if col not in non_numeric:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Pre-calculate cohort min and max for all indicators in INDICATOR_CONFIG
    indicator_extrema: Dict[str, Dict[str, float]] = {}
    for ind_name, cfg in INDICATOR_CONFIG.items():
        csv_col = cfg["csv_column"]
        if csv_col in df.columns:
            series = df[csv_col].dropna()
            if not series.empty:
                indicator_extrema[ind_name] = {
                    "min": float(series.min()),
                    "max": float(series.max())
                }

    seeded_count = 0
    for _, row in df.iterrows():
        city_id = int(row["city_id"])
        city_name = str(row["city"]).strip()
        state_name = str(row["state"]).strip()

        # Demographics
        pop_val = row.get("population_2011", row.get("population", 0.0))
        density_val = row.get("density_per_km2", row.get("density", 0.0))
        population = float(pop_val) if pd.notna(pop_val) else 0.0
        density = float(density_val) if pd.notna(density_val) else 0.0

        # Coordinates from CSV or fallback registry
        coords = CITY_COORDINATES.get(city_name, {"latitude": 20.5937, "longitude": 78.9629})
        row_lat = row.get("latitude")
        row_lon = row.get("longitude")
        lat = float(row_lat) if pd.notna(row_lat) else coords["latitude"]
        lon = float(row_lon) if pd.notna(row_lon) else coords["longitude"]

        # Insert or update City
        city_record = db.query(City).filter(City.city_id == city_id).first()
        if not city_record:
            city_record = City(
                city_id=city_id,
                city=city_name,
                state=state_name,
                country="India",
                population=population,
                density=density,
                latitude=lat,
                longitude=lon
            )
            db.add(city_record)
            db.flush()
        else:
            city_record.city = city_name
            city_record.state = state_name
            city_record.population = population
            city_record.density = density
            city_record.latitude = lat
            city_record.longitude = lon

        # Seed all configured indicators
        for ind_name, cfg in INDICATOR_CONFIG.items():
            csv_col = cfg["csv_column"]
            if csv_col in df.columns and pd.notna(row[csv_col]):
                raw_val = float(row[csv_col])
                if cfg["direction"] == "contextual":
                    norm_val = None
                else:
                    extrema = indicator_extrema.get(ind_name, {})
                    norm_val = normalize_indicator(
                        raw_val,
                        cfg,
                        cohort_min=extrema.get("min"),
                        cohort_max=extrema.get("max"),
                    )

                ind_record = db.query(CityIndicator).filter(
                    CityIndicator.city_id == city_id,
                    CityIndicator.indicator_name == ind_name
                ).first()

                if not ind_record:
                    ind_record = CityIndicator(
                        city_id=city_id,
                        indicator_name=ind_name,
                        value=raw_val,
                        normalized_value=norm_val,
                        unit=cfg["unit"],
                        dimension=cfg["dimension"],
                        direction=cfg["direction"]
                    )
                    db.add(ind_record)
                else:
                    ind_record.value = raw_val
                    ind_record.normalized_value = norm_val
                    ind_record.unit = cfg["unit"]
                    ind_record.dimension = cfg["dimension"]
                    ind_record.direction = cfg["direction"]



        seeded_count += 1

    db.commit()
    logger.info(f"Successfully loaded and normalized {seeded_count} cities into database.")
    return seeded_count
