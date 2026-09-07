import os
import logging
from typing import Dict, List, Optional
import pandas as pd
from sqlalchemy.orm import Session

from app.config import settings, DIMENSION_CONFIG, INDICATOR_METADATA, CITY_COORDINATES
from app.models.city import City
from app.models.indicator import CityIndicator
from app.services.normalization import normalize_value

logger = logging.getLogger("urban_prosperity.data_loader")

REQUIRED_CITY_COLS = ["city_id", "city", "state", "population", "density"]

def load_and_seed_data(db: Session, csv_path: Optional[str] = None) -> int:
    """
    Reads cities.csv, validates columns, normalizes indicators, and seeds database.
    Supports idempotency (updates existing or inserts new).
    """
    if not csv_path:
        # Check default paths
        candidates = [
            settings.CSV_DATA_PATH,
            os.path.join(os.path.dirname(__file__), "..", "..", "data", "cities.csv"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "cities.csv"),
            "cities.csv",
            "data/cities.csv"
        ]
        for p in candidates:
            if os.path.exists(p):
                csv_path = p
                break

    if not csv_path or not os.path.exists(csv_path):
        logger.error(f"cities.csv not found in candidate paths. Checked: {candidates}")
        raise FileNotFoundError(f"cities.csv not found. Please provide a valid CSV path.")

    logger.info(f"Loading city data from {csv_path}")
    df = pd.read_csv(csv_path)

    # 1. Validate required columns
    for col in REQUIRED_CITY_COLS:
        if col not in df.columns:
            raise ValueError(f"Required column '{col}' missing from CSV file.")

    # 2. Convert numeric columns and check missing values
    numeric_cols = [c for c in df.columns if c not in ["city", "state"]]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        missing_count = df[col].isna().sum()
        if missing_count > 0:
            logger.warning(f"Detected {missing_count} missing values in column '{col}'. Filling with median.")
            df[col] = df[col].fillna(df[col].median())

    # Pre-calculate min/max for each indicator present in CSV
    indicator_extrema: Dict[str, Dict[str, float]] = {}
    for ind_name in INDICATOR_METADATA.keys():
        if ind_name in df.columns:
            indicator_extrema[ind_name] = {
                "min": float(df[ind_name].min()),
                "max": float(df[ind_name].max())
            }

    # 3. Seed / Update database
    seeded_count = 0
    for _, row in df.iterrows():
        city_id = int(row["city_id"])
        city_name = str(row["city"]).strip()
        state_name = str(row["state"]).strip()
        population = float(row["population"])
        density = float(row["density"])

        # Determine coordinates
        coords = CITY_COORDINATES.get(city_name, {"latitude": 20.5937, "longitude": 78.9629})
        lat = float(row.get("latitude", coords["latitude"]))
        lon = float(row.get("longitude", coords["longitude"]))

        # Query or create City
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

        # Seed CityIndicators
        for ind_name, meta in INDICATOR_METADATA.items():
            if ind_name in df.columns:
                raw_val = float(row[ind_name])
                min_val = indicator_extrema[ind_name]["min"]
                max_val = indicator_extrema[ind_name]["max"]
                norm_val = normalize_value(raw_val, min_val, max_val, meta["direction"])

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
                        unit=meta["unit"],
                        dimension=meta["dimension"],
                        direction=meta["direction"]
                    )
                    db.add(ind_record)
                else:
                    ind_record.value = raw_val
                    ind_record.normalized_value = norm_val
                    ind_record.unit = meta["unit"]
                    ind_record.dimension = meta["dimension"]
                    ind_record.direction = meta["direction"]

        seeded_count += 1

    db.commit()
    logger.info(f"Successfully loaded and normalized {seeded_count} cities into database.")
    return seeded_count
