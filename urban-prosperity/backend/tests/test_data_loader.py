import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.city import City
from app.models.indicator import CityIndicator
from app.services.data_loader import load_and_seed_data

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_load_and_seed_data(test_db):
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "cities.csv")
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "cities.csv")

    seeded_count = load_and_seed_data(test_db, csv_path=csv_path)
    assert seeded_count == 10

    # Verify cities were inserted
    cities = test_db.query(City).all()
    assert len(cities) == 10
    city_names = {c.city for c in cities}
    assert "Mumbai" in city_names
    assert "Bengaluru" in city_names
    assert "Delhi" in city_names

    # Verify indicators were inserted and normalized
    indicators = test_db.query(CityIndicator).filter(CityIndicator.city_id == 1).all()
    assert len(indicators) > 15
    for ind in indicators:
        assert ind.normalized_value is not None
        assert 0.0 <= ind.normalized_value <= 100.0
