import os
from typing import Dict, List, Literal, TypedDict, Optional
from pydantic_settings import BaseSettings

class IndicatorDefinition(TypedDict, total=False):
    csv_column: str
    dimension: str
    unit: str
    direction: Literal["positive", "negative", "contextual"]
    normalization_method: Literal["min_max", "none"]
    # New fields for extended normalization engine
    norm_type: Literal["direct_score", "percentage", "negative_ref", "relative", "none"]
    ref_min: float          # fixed lower anchor (optional)
    ref_max: float          # fixed upper anchor (optional)
    display_name: str
    description: str

class Settings(BaseSettings):
    PROJECT_NAME: str = "Urban Prosperity Intelligence Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./urban_prosperity.db")
    CSV_DATA_PATH: str = os.getenv("CSV_DATA_PATH", "data/cpi_india_research_dataset.csv")
    CORS_ORIGINS: List[str] = ["*"]
    
    # 6 Core Dimensions
    DIMENSIONS: List[str] = [
        "productivity",
        "infrastructure",
        "quality_of_life",
        "equity",
        "environment",
        "governance",
    ]
    
    DIMENSION_DISPLAY_NAMES: Dict[str, str] = {
        "productivity": "Productivity",
        "infrastructure": "Infrastructure Development",
        "quality_of_life": "Quality of Life",
        "equity": "Equity and Social Inclusion",
        "environment": "Environmental Sustainability",
        "governance": "Governance and Legislation",
    }

    class Config:
        case_sensitive = True

settings = Settings()

# Known geographical coordinates for the 10 Indian cities
CITY_COORDINATES: Dict[str, Dict[str, float]] = {
    "Mumbai": {"latitude": 19.0760, "longitude": 72.8777},
    "Delhi": {"latitude": 28.6139, "longitude": 77.2090},
    "Bengaluru": {"latitude": 12.9716, "longitude": 77.5946},
    "Hyderabad": {"latitude": 17.3850, "longitude": 78.4867},
    "Ahmedabad": {"latitude": 23.0225, "longitude": 72.5714},
    "Chennai": {"latitude": 13.0827, "longitude": 80.2707},
    "Surat": {"latitude": 21.1702, "longitude": 72.8311},
    "Pune": {"latitude": 18.5204, "longitude": 73.8567},
    "Indore": {"latitude": 22.7196, "longitude": 75.8577},
    "Bhopal": {"latitude": 23.2599, "longitude": 77.4126},
}

# ──────────────────────────────────────────────────────────────────────────────
# INDICATOR_CONFIG — single source of truth for every CSV column.
#
# norm_type values:
#   "direct_score"  – indicator is already on a 0-100 scale; index = raw value
#   "percentage"    – intrinsic 0-100% meaning; index = raw value (clamped 0-100)
#   "negative_ref"  – lower raw is better; uses fixed WHO/NCRB reference range
#   "relative"      – cohort min-max (last resort; clearly labelled)
#   "none"          – contextual, not scored
#
# For "negative_ref":
#   ref_min = best possible (clean-air / zero-crime threshold)  → score 100
#   ref_max = worst acceptable threshold                        → score 0
#   formula: score = 100 * (ref_max - x) / (ref_max - ref_min), clamped [0,100]
# ──────────────────────────────────────────────────────────────────────────────
INDICATOR_CONFIG: Dict[str, IndicatorDefinition] = {

    # ── Contextual variables (display only, not scored) ──────────────────────
    "population_2011": {
        "csv_column": "population_2011",
        "dimension": "contextual",
        "unit": "residents",
        "direction": "contextual",
        "normalization_method": "none",
        "norm_type": "none",
        "display_name": "Total Population (2011)",
        "description": "Total municipal population anchor (Census 2011)"
    },
    "density_per_km2": {
        "csv_column": "density_per_km2",
        "dimension": "contextual",
        "unit": "people/km²",
        "direction": "contextual",
        "normalization_method": "none",
        "norm_type": "none",
        "display_name": "Population Density",
        "description": "Urban population concentration per square kilometre"
    },

    # ── 1. Productivity ───────────────────────────────────────────────────────
    "workforce_participation_rate": {
        "csv_column": "workforce_participation_rate",
        "dimension": "productivity",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "relative",          # genuine absolute benchmark unclear; relative ok
        "display_name": "Workforce Participation Rate",
        "description": "Percentage of population participating in economic labour force"
    },
    "economic_density_score": {
        "csv_column": "economic_density_score",
        "dimension": "productivity",
        "unit": "score (0-100)",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "direct_score",      # already on 0-100 scale
        "display_name": "Economic Density Score",
        "description": "Spatial concentration of commercial output and business activity"
    },

    # ── 2. Infrastructure Development ─────────────────────────────────────────
    "water_coverage_pct": {
        "csv_column": "water_coverage_pct",
        "dimension": "infrastructure",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "percentage",        # 0-100% has intrinsic meaning
        "display_name": "Treated Water Supply Coverage",
        "description": "Proportion of households connected to piped municipal water"
    },
    "sewerage_coverage_pct": {
        "csv_column": "sewerage_coverage_pct",
        "dimension": "infrastructure",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "percentage",
        "display_name": "Sewerage Network Coverage",
        "description": "Households with direct access to piped underground sanitation"
    },
    "public_transport_score": {
        "csv_column": "public_transport_score",
        "dimension": "infrastructure",
        "unit": "score (0-100)",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "direct_score",      # 0-100 composite score
        "display_name": "Public Transit Accessibility",
        "description": "Fleet coverage, route frequency, and multimodal reach"
    },
    "road_quality_score": {
        "csv_column": "road_quality_score",
        "dimension": "infrastructure",
        "unit": "score (0-100)",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "direct_score",
        "display_name": "Road Quality Score",
        "description": "Condition and maintenance level of primary urban corridors"
    },
    "internet_access_pct": {
        "csv_column": "internet_access_pct",
        "dimension": "infrastructure",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "percentage",
        "display_name": "High-Speed Internet Penetration",
        "description": "Proportion of urban households with fixed broadband connectivity"
    },

    # ── 3. Quality of Life ────────────────────────────────────────────────────
    "literacy_rate": {
        "csv_column": "literacy_rate",
        "dimension": "quality_of_life",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "percentage",
        "display_name": "Literacy Rate",
        "description": "Urban literacy percentage for population aged 7 and above"
    },
    "health_facilities_per_100k": {
        "csv_column": "health_facilities_per_100k",
        "dimension": "quality_of_life",
        "unit": "per 100k",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "relative",          # no universal per-100k Indian benchmark; use cohort
        "display_name": "Healthcare Facilities Density",
        "description": "Public and accredited private medical facilities per 100,000 residents"
    },
    "crime_rate_per_100k": {
        "csv_column": "crime_rate_per_100k",
        "dimension": "quality_of_life",
        "unit": "per 100k",
        "direction": "negative",
        "normalization_method": "min_max",
        "norm_type": "negative_ref",
        # NCRB reference: ~100/100k considered low; 700/100k near worst urban India
        "ref_min": 100.0,
        "ref_max": 700.0,
        "display_name": "Cognizable Crime Rate",
        "description": "Total IPC cognizable offences recorded per 100,000 residents (lower is better)"
    },
    "school_access_pct": {
        "csv_column": "school_access_pct",
        "dimension": "quality_of_life",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "percentage",
        "display_name": "Primary & Secondary School Access",
        "description": "Population within 1.5 km of recognised educational institutions"
    },

    # ── 4. Equity and Social Inclusion ────────────────────────────────────────
    "poverty_rate_pct": {
        "csv_column": "poverty_rate_pct",
        "dimension": "equity",
        "unit": "%",
        "direction": "negative",
        "normalization_method": "min_max",
        "norm_type": "negative_ref",
        # 0% poverty = 100 score; 40% = 0 score (Indian urban poverty ceiling)
        "ref_min": 0.0,
        "ref_max": 40.0,
        "display_name": "Multidimensional Poverty Rate",
        "description": "Proportion of households below poverty threshold (lower is better)"
    },
    "slum_population_pct": {
        "csv_column": "slum_population_pct",
        "dimension": "equity",
        "unit": "%",
        "direction": "negative",
        "normalization_method": "min_max",
        "norm_type": "negative_ref",
        # 0% slum = 100 score; 50% = 0 score (national urban high-end)
        "ref_min": 0.0,
        "ref_max": 50.0,
        "display_name": "Informal Settlement Population",
        "description": "Percentage of city residents in designated slum clusters (lower is better)"
    },
    "gender_workforce_gap_pct": {
        "csv_column": "gender_workforce_gap_pct",
        "dimension": "equity",
        "unit": "%",
        "direction": "negative",
        "normalization_method": "min_max",
        "norm_type": "negative_ref",
        # 0% gap = 100 score; 30% gap = 0 score (national ceiling for urban India)
        "ref_min": 0.0,
        "ref_max": 30.0,
        "display_name": "Gender Workforce Participation Gap",
        "description": "Disparity between male and female workforce participation (lower is better)"
    },

    # ── 5. Environmental Sustainability ──────────────────────────────────────
    "pm25_ug_m3": {
        "csv_column": "pm25_ug_m3",
        "dimension": "environment",
        "unit": "µg/m³",
        "direction": "negative",
        "normalization_method": "min_max",
        "norm_type": "negative_ref",
        # WHO annual guideline: 5 µg/m³ = 100 score; Indian NAAQS ceiling 60 µg/m³ = 0
        "ref_min": 5.0,
        "ref_max": 120.0,
        "display_name": "Fine Particulate Matter (PM2.5)",
        "description": "Annual mean PM2.5 concentration — WHO guideline 5 µg/m³ (lower is better)"
    },
    "pm10_ug_m3": {
        "csv_column": "pm10_ug_m3",
        "dimension": "environment",
        "unit": "µg/m³",
        "direction": "negative",
        "normalization_method": "min_max",
        "norm_type": "negative_ref",
        # WHO annual guideline: 15 µg/m³ = 100 score; Indian NAAQS 100 µg/m³, urban max 250 = 0
        "ref_min": 15.0,
        "ref_max": 250.0,
        "display_name": "Coarse Particulate Matter (PM10)",
        "description": "Annual mean PM10 concentration — WHO guideline 15 µg/m³ (lower is better)"
    },
    "no2_ug_m3": {
        "csv_column": "no2_ug_m3",
        "dimension": "environment",
        "unit": "µg/m³",
        "direction": "negative",
        "normalization_method": "min_max",
        "norm_type": "negative_ref",
        # WHO annual guideline: 10 µg/m³ = 100 score; Indian NAAQS ceiling 80 µg/m³ = 0
        "ref_min": 10.0,
        "ref_max": 80.0,
        "display_name": "Nitrogen Dioxide (NO2)",
        "description": "Annual ambient NO2 concentration — WHO guideline 10 µg/m³ (lower is better)"
    },
    "green_space_pct": {
        "csv_column": "green_space_pct",
        "dimension": "environment",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "percentage",
        "display_name": "Urban Green Space Ratio",
        "description": "Parks, urban forests, and recreational green area as % of city area"
    },
    "waste_collection_pct": {
        "csv_column": "waste_collection_pct",
        "dimension": "environment",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "percentage",        # 0-100% has intrinsic meaning
        "display_name": "Solid Waste Collection Efficiency",
        "description": "Proportion of daily municipal solid waste collected"
    },
    "waste_treatment_pct": {
        "csv_column": "waste_treatment_pct",
        "dimension": "environment",
        "unit": "%",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "percentage",
        "display_name": "Waste Scientific Treatment & Processing",
        "description": "Percentage of collected waste processed through scientific composting or recycling"
    },

    # ── 6. Governance and Legislation ────────────────────────────────────────
    "municipal_service_score": {
        "csv_column": "municipal_service_score",
        "dimension": "governance",
        "unit": "score (0-100)",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "direct_score",      # 0-100 scale; use raw as index
        "display_name": "Municipal Service Delivery Score",
        "description": "Citizen grievance redressal, digital governance, and civic service response"
    },
    "governance_score": {
        "csv_column": "governance_score",
        "dimension": "governance",
        "unit": "score (0-100)",
        "direction": "positive",
        "normalization_method": "min_max",
        "norm_type": "direct_score",
        "display_name": "Urban Governance & Fiscal Autonomy",
        "description": "Fiscal transparency, municipal revenue generation, and regulatory compliance"
    },

    # ── Additional contextual benchmarks ─────────────────────────────────────
    "eoli_2020": {
        "csv_column": "eoli_2020",
        "dimension": "contextual",
        "unit": "score",
        "direction": "contextual",
        "normalization_method": "none",
        "norm_type": "none",
        "display_name": "Ease of Living Index (2020)",
        "description": "MoHUA Ease of Living Index official score benchmark"
    },
    "mpi_2020": {
        "csv_column": "mpi_2020",
        "dimension": "contextual",
        "unit": "score",
        "direction": "contextual",
        "normalization_method": "none",
        "norm_type": "none",
        "display_name": "Municipal Performance Index (2020)",
        "description": "MoHUA Municipal Performance Index official score benchmark"
    },
}


# Contributory indicators per dimension (contextual variables excluded)
DIMENSION_CONFIG: Dict[str, List[str]] = {
    "productivity": [
        "workforce_participation_rate",
        "economic_density_score",
    ],
    "infrastructure": [
        "water_coverage_pct",
        "sewerage_coverage_pct",
        "public_transport_score",
        "road_quality_score",
        "internet_access_pct",
    ],
    "quality_of_life": [
        "literacy_rate",
        "health_facilities_per_100k",
        "crime_rate_per_100k",
        "school_access_pct",
    ],
    "equity": [
        "poverty_rate_pct",
        "slum_population_pct",
        "gender_workforce_gap_pct",
    ],
    "environment": [
        "pm25_ug_m3",
        "pm10_ug_m3",
        "no2_ug_m3",
        "green_space_pct",
        "waste_collection_pct",
        "waste_treatment_pct",
    ],
    "governance": [
        "municipal_service_score",
        "governance_score",
    ],
}

# Alias for backward compatibility
INDICATOR_METADATA = INDICATOR_CONFIG.copy()

# Add shorthand aliases so endpoints querying metadata for aliases (pm25, population, etc.) succeed.
for _alias, _target in [
    ("pm25", "pm25_ug_m3"),
    ("pm10", "pm10_ug_m3"),
    ("no2", "no2_ug_m3"),
    ("population", "population_2011"),
    ("density", "density_per_km2"),
]:
    if _target in INDICATOR_METADATA and _alias not in INDICATOR_METADATA:
        INDICATOR_METADATA[_alias] = INDICATOR_METADATA[_target].copy()
