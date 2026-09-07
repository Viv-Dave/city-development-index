from sqlalchemy import Column, Integer, String, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class CityIndicator(Base):
    __tablename__ = "city_indicators"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    city_id = Column(Integer, ForeignKey("cities.city_id", ondelete="CASCADE"), nullable=False, index=True)
    indicator_name = Column(String(100), nullable=False, index=True)
    value = Column(Float, nullable=False)
    normalized_value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    dimension = Column(String(50), nullable=False, index=True)
    direction = Column(String(20), nullable=False)  # "positive" or "negative"

    city_rel = relationship("City", back_populates="indicators")

    __table_args__ = (
        UniqueConstraint("city_id", "indicator_name", name="uix_city_indicator"),
    )

    def __repr__(self):
        return f"<CityIndicator(city_id={self.city_id}, indicator='{self.indicator_name}', value={self.value})>"
