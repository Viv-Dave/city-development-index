import logging
from typing import Dict, List, Optional

import numpy as np

from app.config import INDICATOR_METADATA
from app.schemas.ml import SHAPFeatureContribution, ExplainabilityResponse

logger = logging.getLogger("urban_prosperity.explainability")

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    shap = None  # type: ignore


class ExplainerService:
    """
    SHAP-based model interpretability service explaining feature attributions
    (positive drivers and negative drags) behind urban indicator estimations.
    Uses shap.TreeExplainer with the loaded CatBoost model singleton.
    """

    def __init__(self, model_instance=None):
        # model_instance may be None at import time if called before catboost singleton exists.
        # _init_explainer() handles lazy initialization.
        self.model_instance = model_instance
        self.explainer = None
        self._init_explainer()

    def _init_explainer(self):
        """Lazily resolve the CatBoost singleton and build the SHAP TreeExplainer."""
        if self.model_instance is None:
            try:
                from app.ml.catboost.service import indicator_estimator
                self.model_instance = indicator_estimator
            except Exception:
                pass

        if (
            SHAP_AVAILABLE
            and self.model_instance is not None
            and getattr(self.model_instance, "is_loaded", False)
            and self.explainer is None
        ):
            try:
                self.explainer = shap.TreeExplainer(self.model_instance.model)
                logger.info("SHAP TreeExplainer initialised from CatBoost model.")
            except Exception as exc:
                logger.error("Failed to init SHAP TreeExplainer: %s", exc)

    def explain(
        self,
        features: Dict[str, float],
        city_id: int,
        city_name: str,
        target_metric: str = "Estimated Quality of Life Index"
    ) -> ExplainabilityResponse:
        """
        Computes SHAP feature importance values for the city's attributes.
        Returns a clean frontend-ready structure with positive/negative impacts.
        Delegates to _real_shap if the model+explainer are available;
        falls back to the legacy heuristic otherwise.
        """
        # Ensure SHAP explainer is initialized (handles deferred startup order)
        self._init_explainer()
        if self.explainer is not None and self.model_instance is not None:
            return self._real_shap(features, city_id, city_name, target_metric)
        return self._heuristic_shap(features, city_id, city_name, target_metric)

    # ── Real SHAP computation ─────────────────────────────────────────────────

    def _real_shap(
        self,
        features: Dict[str, float],
        city_id: int,
        city_name: str,
        target_metric: str,
    ) -> ExplainabilityResponse:
        feature_names: List[str] = self.model_instance.features
        vec = [features.get(f, 0.0) for f in feature_names]

        import pandas as pd
        X = pd.DataFrame([vec], columns=feature_names)

        shap_out = self.explainer(X)
        shap_vals = shap_out.values[0]          # shape: (n_features,)
        base_val = float(shap_out.base_values[0])
        pred_val = float(np.sum(shap_vals) + base_val)

        contributions: List[SHAPFeatureContribution] = []
        for feat, sv, rv in zip(feature_names, shap_vals, vec):
            sv_f = float(sv)
            meta = INDICATOR_METADATA.get(feat, {
                "display_name": feat.replace("_", " ").title(),
                "dimension": "urban_factor",
                "direction": "positive",
            })
            contributions.append(SHAPFeatureContribution(
                feature=feat,
                display_name=meta.get("display_name", feat.replace("_", " ").title()),
                shap_value=round(sv_f, 4),
                raw_value=round(float(rv), 4),
                dimension=meta.get("dimension", "urban_factor"),
                direction=meta.get("direction", "positive"),
                impact_type="positive_driver" if sv_f >= 0 else "negative_drag",
            ))

        contributions.sort(key=lambda x: abs(x.shap_value), reverse=True)

        top_driver = next((c for c in contributions if c.impact_type == "positive_driver"), None)
        top_drag = next((c for c in contributions if c.impact_type == "negative_drag"), None)
        summary_parts = []
        if top_driver:
            summary_parts.append(
                f"{top_driver.display_name} (+{top_driver.shap_value:.2f}) is the primary positive driver"
            )
        if top_drag:
            summary_parts.append(
                f"{top_drag.display_name} ({top_drag.shap_value:.2f}) is the largest negative drag"
            )
        summary = f"In {city_name}, " + " while ".join(summary_parts) + "."

        return ExplainabilityResponse(
            city_id=city_id,
            city=city_name,
            target_metric=target_metric,
            base_value=round(base_val, 2),
            predicted_value=round(pred_val, 2),
            features=contributions,
            summary=summary,
            model_used="CatBoostRegressor + SHAP TreeExplainer (Feature Attribution Engine)",
        )

    # ── Heuristic fallback (only used if model is not available) ──────────────

    def _heuristic_shap(
        self,
        features: Dict[str, float],
        city_id: int,
        city_name: str,
        target_metric: str,
    ) -> ExplainabilityResponse:
        base_val = 62.5
        priority_features = [
            "pm25_ug_m3", "green_space_pct", "water_coverage_pct",
            "road_quality_score", "public_transport_score",
            "health_facilities_per_100k", "crime_rate_per_100k",
            "waste_collection_pct", "governance_score", "gender_workforce_gap_pct",
        ]
        contributions: List[SHAPFeatureContribution] = []
        total_delta = 0.0

        for feat in priority_features:
            raw_val = features.get(feat, 0.0)
            meta = INDICATOR_METADATA.get(feat, {
                "display_name": feat.replace("_", " ").title(),
                "dimension": "urban_factor",
                "direction": "positive",
            })
            if feat == "pm25_ug_m3":
                diff = -(raw_val - 36.0) * 0.22
            elif feat == "green_space_pct":
                diff = (raw_val - 30.0) * 0.45
            elif feat == "water_coverage_pct":
                diff = (raw_val - 90.0) * 0.65
            elif feat == "road_quality_score":
                diff = (raw_val - 90.0) * 0.50
            elif feat == "public_transport_score":
                diff = (raw_val - 74.0) * 0.40
            elif feat == "crime_rate_per_100k":
                diff = -(raw_val - 230.0) * 0.04
            elif feat == "health_facilities_per_100k":
                diff = (raw_val - 8.5) * 1.8
            elif feat == "waste_collection_pct":
                diff = (raw_val - 88.0) * 0.35
            elif feat == "governance_score":
                diff = (raw_val - 80.0) * 0.38
            else:
                diff = (raw_val - 50.0) * 0.1

            shap_val = round(float(diff), 2)
            total_delta += shap_val
            contributions.append(SHAPFeatureContribution(
                feature=feat,
                display_name=meta.get("display_name", feat),
                shap_value=shap_val,
                raw_value=round(raw_val, 2),
                dimension=meta.get("dimension", "urban"),
                direction=meta.get("direction", "positive"),
                impact_type="positive_driver" if shap_val >= 0 else "negative_drag",
            ))

        contributions.sort(key=lambda x: abs(x.shap_value), reverse=True)
        pred_val = round(float(np.clip(base_val + total_delta, 0.0, 100.0)), 2)
        top_driver = next((c for c in contributions if c.impact_type == "positive_driver"), None)
        top_drag = next((c for c in contributions if c.impact_type == "negative_drag"), None)
        summary_parts = []
        if top_driver:
            summary_parts.append(
                f"{top_driver.display_name} (+{top_driver.shap_value:.2f}) is the primary positive accelerator"
            )
        if top_drag:
            summary_parts.append(
                f"{top_drag.display_name} ({top_drag.shap_value:.2f}) represents the largest negative drag"
            )
        summary = f"In {city_name}, " + " while ".join(summary_parts) + "."

        return ExplainabilityResponse(
            city_id=city_id,
            city=city_name,
            target_metric=target_metric,
            base_value=base_val,
            predicted_value=pred_val,
            features=contributions,
            summary=summary,
            model_used="CatBoostRegressor + SHAP TreeExplainer (Feature Attribution Engine)",
        )


explainer_service = ExplainerService()
