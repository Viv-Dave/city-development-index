from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base

class City(Base):
    __tablename__ = "cities"

    city_id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), nullable=False, unique=True, index=True)
    state = Column(String(100), nullable=False)
    country = Column(String(100), default="India", nullable=False)
    population = Column(Float, nullable=False)
    density = Column(Float, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    indicators = relationship("CityIndicator", back_populates="city_rel", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="city_rel", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<City(id={self.city_id}, name='{self.city}', state='{self.state}')>"
