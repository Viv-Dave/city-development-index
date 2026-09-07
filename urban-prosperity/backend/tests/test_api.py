import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.services.data_loader import load_and_seed_data
import os

from sqlalchemy.pool import StaticPool
import os

# Create test database with StaticPool so all connections share the same in-memory SQLite DB
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "cities.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "cities.csv")
    load_and_seed_data(db, csv_path=csv_path)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_all_cities():
    response = client.get("/api/cities")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 10
    assert "city" in data[0]
    assert "overall_cpi" in data[0]
    assert data[0]["overall_cpi"] is not None

def test_get_single_city():
    response = client.get("/api/cities/1")
    assert response.status_code == 200
    data = response.json()
    assert data["city_id"] == 1
    assert data["city"] == "Mumbai"

def test_get_city_cpi():
    response = client.get("/api/cities/1/cpi")
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Mumbai"
    assert 0.0 <= data["overall_cpi"] <= 100.0
    dims = data["dimensions"]
    assert 0.0 <= dims["productivity"] <= 100.0
    assert 0.0 <= dims["infrastructure"] <= 100.0
    assert 0.0 <= dims["quality_of_life"] <= 100.0
    assert 0.0 <= dims["equity"] <= 100.0
    assert 0.0 <= dims["environment"] <= 100.0
    assert 0.0 <= dims["governance"] <= 100.0
    assert len(data["indicators"]) > 15
    assert len(data["ai_insights"]) > 0

def test_cpi_rankings():
    response = client.get("/api/cpi/rankings")
    assert response.status_code == 200
    data = response.json()
    assert data["total_cities"] == 10
    assert len(data["rankings"]) == 10
    assert data["national_average_cpi"] > 0
    # Ensure ranked in descending order
    scores = [item["overall_cpi"] for item in data["rankings"]]
    assert scores == sorted(scores, reverse=True)

def test_compare_cities():
    response = client.get("/api/cpi/compare?cities=1,2,3")
    assert response.status_code == 200
    data = response.json()
    assert len(data["cities"]) == 3
    assert "cohort_averages" in data
    assert "strengths_and_weaknesses" in data

def test_indicators_city():
    response = client.get("/api/indicators/1")
    assert response.status_code == 200
    data = response.json()
    assert data["city_id"] == 1
    assert len(data["indicators"]) > 0

def test_specific_indicator():
    response = client.get("/api/indicators/1/pm25")
    assert response.status_code == 200
    data = response.json()
    assert data["indicator_name"] == "pm25"
    assert data["direction"] == "negative"

def test_predictions_endpoint():
    response = client.get("/api/predictions/1")
    assert response.status_code == 200
    data = response.json()
    assert "pm25_forecast" in data
    assert "road_damage_assessment" in data
    assert "estimated_target_indicator" in data
    assert "explainability" in data

def test_pm25_forecast_post():
    response = client.post("/api/predictions/pm25", json={"city_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert len(data["forecast_24h"]) == 24
    assert data["city"] == "Mumbai"

def test_road_damage_post():
    response = client.post("/api/models/road-damage", data={"city_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert "damage_density_per_sqm" in data
    assert "estimated_road_quality_score" in data

def test_explainability_get():
    response = client.get("/api/explainability/1")
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Mumbai"
    assert len(data["features"]) > 0
