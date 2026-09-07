import os
from typing import Dict, List, Literal, TypedDict
from pydantic_settings import BaseSettings

class IndicatorConfig(TypedDict):
    name: str
    dimension: str
    direction: Literal["positive", "negative"]
    unit: str
    display_name: str
    description: str

class Settings(BaseSettings):
    PROJECT_NAME: str = "Urban Prosperity Intelligence Platform"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./urban_prosperity.db")
    CSV_DATA_PATH: str = os.getenv("CSV_DATA_PATH", "data/cities.csv")
    CORS_ORIGINS: List[str] = ["*"]
    
    # Dimension equal weights (1/6 = ~0.1666667)
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
    "Pune": {"latitude": 18.5204, "longitude": 73.8567},
    "Bengaluru": {"latitude": 12.9716, "longitude": 77.5946},
    "Chennai": {"latitude": 13.0827, "longitude": 80.2707},
    "Delhi": {"latitude": 28.6139, "longitude": 77.2090},
    "Hyderabad": {"latitude": 17.3850, "longitude": 78.4867},
    "Ahmedabad": {"latitude": 23.0225, "longitude": 72.5714},
    "Surat": {"latitude": 21.1702, "longitude": 72.8311},
    "Indore": {"latitude": 22.7196, "longitude": 75.8577},
    "Bhopal": {"latitude": 23.2599, "longitude": 77.4126},
}

# Dimension to Indicator mapping as specified in requirements
DIMENSION_CONFIG: Dict[str, List[str]] = {
    "productivity": [
        "workforce_participation_rate",
        "economic_density_score",
        "density",
        "population",
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
        "pm25",
        "pm10",
        "no2",
        "green_space_pct",
        "waste_collection_pct",
        "waste_treatment_pct",
    ],
    "governance": [
        "municipal_service_score",
        "governance_score",
    ],
}

# Complete indicator metadata registry
INDICATOR_METADATA: Dict[str, IndicatorConfig] = {
    # Productivity
    "workforce_participation_rate": {
        "name": "workforce_participation_rate",
        "dimension": "productivity",
        "direction": "positive",
        "unit": "%",
        "display_name": "Workforce Participation Rate",
        "description": "Percentage of population participating in economic labor force"
    },
    "economic_density_score": {
        "name": "economic_density_score",
        "dimension": "productivity",
        "direction": "positive",
        "unit": "score (0-100)",
        "display_name": "Economic Density Score",
        "description": "Spatial concentration of commercial output and business activity"
    },
    "density": {
        "name": "density",
        "dimension": "productivity",
        "direction": "positive",
        "unit": "people/km²",
        "display_name": "Population Density",
        "description": "Urban density enabling agglomeration economies"
    },
    "population": {
        "name": "population",
        "dimension": "productivity",
        "direction": "positive",
        "unit": "residents",
        "display_name": "Total Population",
        "description": "Agglomeration scale of the metropolitan population"
    },
    
    # Infrastructure
    "water_coverage_pct": {
        "name": "water_coverage_pct",
        "dimension": "infrastructure",
        "direction": "positive",
        "unit": "%",
        "display_name": "Treated Water Supply Coverage",
        "description": "Proportion of households connected to piped municipal water"
    },
    "sewerage_coverage_pct": {
        "name": "sewerage_coverage_pct",
        "dimension": "infrastructure",
        "direction": "positive",
        "unit": "%",
        "display_name": "Sewerage Network Coverage",
        "description": "Households with direct access to piped underground sanitation"
    },
    "public_transport_score": {
        "name": "public_transport_score",
        "dimension": "infrastructure",
        "direction": "positive",
        "unit": "score (0-100)",
        "display_name": "Public Transit Accessibility",
        "description": "Fleet coverage, route frequency, and multimodal reach"
    },
    "road_quality_score": {
        "name": "road_quality_score",
        "dimension": "infrastructure",
        "direction": "positive",
        "unit": "score (0-100)",
        "display_name": "Pavement & Road Quality Index",
        "description": "Condition of primary and secondary urban arterial corridors"
    },
    "internet_access_pct": {
        "name": "internet_access_pct",
        "dimension": "infrastructure",
        "direction": "positive",
        "unit": "%",
        "display_name": "High-Speed Internet Penetration",
        "description": "Proportion of urban households with fixed broadband/high-speed connectivity"
    },

    # Quality of Life
    "literacy_rate": {
        "name": "literacy_rate",
        "dimension": "quality_of_life",
        "direction": "positive",
        "unit": "%",
        "display_name": "Literacy Rate",
        "description": "Urban literacy percentage for population aged 7 and above"
    },
    "health_facilities_per_100k": {
        "name": "health_facilities_per_100k",
        "dimension": "quality_of_life",
        "direction": "positive",
        "unit": "per 100k",
        "display_name": "Healthcare Facilities Density",
        "description": "Number of public and accredited private medical clinics and hospitals per 100,000 residents"
    },
    "crime_rate_per_100k": {
        "name": "crime_rate_per_100k",
        "dimension": "quality_of_life",
        "direction": "negative",
        "unit": "per 100k",
        "display_name": "Cognizable Crime Rate",
        "description": "Total IPC cognizable offenses recorded per 100,000 residents (lower is better)"
    },
    "school_access_pct": {
        "name": "school_access_pct",
        "dimension": "quality_of_life",
        "direction": "positive",
        "unit": "%",
        "display_name": "Primary & Secondary School Access",
        "description": "Population living within 1.5 km of recognized educational institutions"
    },

    # Equity and Social Inclusion
    "poverty_rate_pct": {
        "name": "poverty_rate_pct",
        "dimension": "equity",
        "direction": "negative",
        "unit": "%",
        "display_name": "Multidimensional Poverty Rate",
        "description": "Proportion of households below poverty threshold (lower is better)"
    },
    "slum_population_pct": {
        "name": "slum_population_pct",
        "dimension": "equity",
        "direction": "negative",
        "unit": "%",
        "display_name": "Informal Settlement Population",
        "description": "Percentage of city residents dwelling in designated slum clusters (lower is better)"
    },
    "gender_workforce_gap_pct": {
        "name": "gender_workforce_gap_pct",
        "dimension": "equity",
        "direction": "negative",
        "unit": "%",
        "display_name": "Gender Workforce Participation Gap",
        "description": "Disparity between male and female workforce participation (lower is better)"
    },

    # Environmental Sustainability
    "pm25": {
        "name": "pm25",
        "dimension": "environment",
        "direction": "negative",
        "unit": "µg/m³",
        "display_name": "Fine Particulate Matter (PM2.5)",
        "description": "Annual mean concentration of particulate matter ≤ 2.5 micrometers (lower is better)"
    },
    "pm10": {
        "name": "pm10",
        "dimension": "environment",
        "direction": "negative",
        "unit": "µg/m³",
        "display_name": "Coarse Particulate Matter (PM10)",
        "description": "Annual mean concentration of particulate matter ≤ 10 micrometers (lower is better)"
    },
    "no2": {
        "name": "no2",
        "dimension": "environment",
        "direction": "negative",
        "unit": "µg/m³",
        "display_name": "Nitrogen Dioxide (NO2)",
        "description": "Annual ambient nitrogen dioxide emissions concentration (lower is better)"
    },
    "green_space_pct": {
        "name": "green_space_pct",
        "dimension": "environment",
        "direction": "positive",
        "unit": "%",
        "display_name": "Urban Green Space Ratio",
        "description": "Parks, urban forests, and recreational green area percentage"
    },
    "waste_collection_pct": {
        "name": "waste_collection_pct",
        "dimension": "environment",
        "direction": "positive",
        "unit": "%",
        "display_name": "Solid Waste Collection Efficiency",
        "description": "Proportion of daily generated municipal solid waste collected"
    },
    "waste_treatment_pct": {
        "name": "waste_treatment_pct",
        "dimension": "environment",
        "direction": "positive",
        "unit": "%",
        "display_name": "Waste Scientific Treatment & Processing",
        "description": "Percentage of collected waste processed through scientific composting or recycling"
    },

    # Governance
    "municipal_service_score": {
        "name": "municipal_service_score",
        "dimension": "governance",
        "direction": "positive",
        "unit": "score (0-100)",
        "display_name": "Municipal Service Delivery Score",
        "description": "Citizen grievance redressal, digital governance, and civic service response"
    },
    "governance_score": {
        "name": "governance_score",
        "dimension": "governance",
        "direction": "positive",
        "unit": "score (0-100)",
        "display_name": "Urban Governance & Fiscal Autonomy",
        "description": "Fiscal transparency, municipal revenue generation, and regulatory compliance"
    }
}
