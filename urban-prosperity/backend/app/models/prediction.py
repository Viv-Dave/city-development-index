from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    city_id = Column(Integer, ForeignKey("cities.city_id", ondelete="CASCADE"), nullable=False, index=True)
    model_name = Column(String(50), nullable=False)  # 'lstm', 'yolo', 'catboost'
    target_metric = Column(String(50), nullable=False) # 'pm25', 'road_damage', etc.
    predicted_value = Column(Float, nullable=True)
    metadata_payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    city_rel = relationship("City", back_populates="predictions")

    def __repr__(self):
        return f"<PredictionRecord(city_id={self.city_id}, model='{self.model_name}', target='{self.target_metric}')>"
