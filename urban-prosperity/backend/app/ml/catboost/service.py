import json
import logging
import os
from typing import Dict, List, Optional

import numpy as np

logger = logging.getLogger("urban_prosperity.catboost")

try:
    from catboost import CatBoostRegressor
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False
    CatBoostRegressor = None  # type: ignore

# Paths resolved relative to this file's location:
# backend/app/ml/catboost/service.py → backend/models/artifacts/catboost_qol/
_ARTIFACTS_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "artifacts", "catboost_qol")
)
_MODEL_PATH = os.path.join(_ARTIFACTS_DIR, "qol_catboost_model.cbm")
_META_PATH = os.path.join(_ARTIFACTS_DIR, "model_metadata.json")


def _load_metadata() -> dict:
    with open(_META_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


class IndicatorEstimator:
    """
    CatBoost-powered tabular model for municipal indicator estimation.
    Loads qol_catboost_model.cbm once at startup and reuses it per request.
    Feature order is driven by model_metadata.json — never hard-coded here.
    """

    def __init__(self):
        self.model: Optional[CatBoostRegressor] = None  # type: ignore
        self.is_loaded: bool = False
        self.features: List[str] = []       # feature names in training order
        self.target: str = "quality_of_life_index"

        if not CATBOOST_AVAILABLE:
            logger.warning("catboost not installed — CatBoost predictions will use fallback.")
            return

        if not os.path.exists(_MODEL_PATH):
            logger.warning("qol_catboost_model.cbm not found at %s", _MODEL_PATH)
            return

        try:
            self.model = CatBoostRegressor()  # type: ignore
            self.model.load_model(_MODEL_PATH)
            meta = _load_metadata()
            self.features = meta["features"]
            self.target = meta.get("target", self.target)
            self.is_loaded = True
            logger.info("CatBoost QoL model loaded (%d features).", len(self.features))
        except Exception as exc:
            logger.error("Failed to load CatBoost model: %s", exc, exc_info=True)
            self.is_loaded = False

    def predict_from_vector(self, feature_vector: List[float]) -> float:
        """
        Run inference from an already-ordered feature vector (model_metadata order).
        """
        if self.is_loaded and self.model is not None:
            pred = self.model.predict([feature_vector])[0]
            return float(pred)
        return self._fallback(feature_vector)

    def predict(self, features: Dict[str, float]) -> float:
        """
        Legacy helper: accepts a dict of indicator_name→value pairs
        and returns the predicted QoL index. Used by ModelService.
        """
        if self.is_loaded and self.model is not None:
            vec = [features.get(f, 0.0) for f in self.features]
            return self.predict_from_vector(vec)
        return self._fallback_dict(features)

    # ── Fallback formula (only used when model is not available) ──────────────

    def _fallback(self, vec: List[float]) -> float:
        """Simple empirical formula as a safety net — never used in production."""
        return float(np.clip(50.0, 10.0, 98.0))

    def _fallback_dict(self, features: Dict[str, float]) -> float:
        water = features.get("water_coverage_pct", 85.0)
        green = features.get("green_space_pct", 25.0)
        transit = features.get("public_transport_score", 70.0)
        pm25 = features.get("pm25_ug_m3", features.get("pm25", 4.0))
        est = (0.35 * water) + (0.45 * green) + (0.30 * transit) - (4.2 * pm25)
        return float(np.clip(est, 10.0, 98.0))


# Module-level singleton — loaded once when the app starts.
indicator_estimator = IndicatorEstimator()
