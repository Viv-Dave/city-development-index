"""
normalization.py  Urban Prosperity CPI normalization engine.

Four normalization strategies:

1. direct_score   -- indicator already on 0-100 scale; index = raw value
2. percentage     -- 0-100% has intrinsic meaning; index = raw value clamped to [0, 100]
3. negative_ref   -- fixed WHO/NCRB reference anchors; lower raw = higher score
                     score = 100 * (ref_max - x) / (ref_max - ref_min)
4. relative       -- cohort min-max (last resort for indicators with no absolute benchmark)
                     positive: 100 * (x - cohort_min) / (cohort_max - cohort_min)
                     negative: 100 * (cohort_max - x) / (cohort_max - cohort_min)
5. none           -- contextual; returns None
"""
from typing import Dict, List, Literal, Optional, Sequence, TYPE_CHECKING
import numpy as np

if TYPE_CHECKING:
    from app.config import IndicatorDefinition


def normalize_indicator(
    x: float,
    cfg,
    cohort_min=None,
    cohort_max=None,
):
    """
    Normalize a single raw value according to the indicator norm_type.

    Parameters
    ----------
    x            : raw value
    cfg          : INDICATOR_CONFIG entry for this indicator
    cohort_min   : pre-computed cohort minimum (required for norm_type=relative)
    cohort_max   : pre-computed cohort maximum (required for norm_type=relative)

    Returns
    -------
    Normalized score in [0, 100] or None for contextual indicators.
    """
    norm_type = cfg.get("norm_type", "relative")

    if norm_type == "none" or cfg.get("direction") == "contextual":
        return None

    if x is None or np.isnan(x):
        return None

    # 1. direct_score
    if norm_type == "direct_score":
        return float(np.clip(x, 0.0, 100.0))

    # 2. percentage
    if norm_type == "percentage":
        return float(np.clip(x, 0.0, 100.0))

    # 3. negative_ref
    if norm_type == "negative_ref":
        ref_min = cfg.get("ref_min")
        ref_max = cfg.get("ref_max")
        if ref_min is None or ref_max is None:
            raise ValueError(
                "norm_type=negative_ref requires ref_min and ref_max in INDICATOR_CONFIG"
            )
        span = ref_max - ref_min
        if np.isclose(span, 0.0):
            return 100.0
        score = 100.0 * (ref_max - x) / span
        return float(np.clip(score, 0.0, 100.0))

    # 4. relative (cohort min-max)
    if norm_type == "relative":
        if cohort_min is None or cohort_max is None:
            return None
        direction = cfg.get("direction", "positive")
        if np.isclose(cohort_max, cohort_min):
            return 100.0
        if direction == "positive":
            score = 100.0 * (x - cohort_min) / (cohort_max - cohort_min)
        elif direction == "negative":
            score = 100.0 * (cohort_max - x) / (cohort_max - cohort_min)
        else:
            return None
        return float(np.clip(score, 0.0, 100.0))

    return None


# ---------------------------------------------------------------------------
# Legacy helpers kept for backward-compatibility with existing tests
# ---------------------------------------------------------------------------
def normalize_value(
    x,
    min_x,
    max_x,
    direction="positive",
):
    """
    Cohort min-max normalization (legacy shim).
    max == min returns 100.0 per specification.
    contextual returns None.
    """
    if direction == "contextual":
        return None
    if x is None or np.isnan(x):
        return None
    if np.isclose(max_x, min_x):
        return 100.0
    if direction == "positive":
        normalized = 100.0 * (x - min_x) / (max_x - min_x)
    elif direction == "negative":
        normalized = 100.0 * (max_x - x) / (max_x - min_x)
    else:
        return None
    return float(np.clip(normalized, 0.0, 100.0))


def normalize_series(values, direction="positive"):
    """Normalize an entire sequence of indicator values (legacy shim)."""
    if direction == "contextual":
        return [None for _ in values]
    clean_vals = [v for v in values if v is not None and not np.isnan(v)]
    if not clean_vals:
        return [100.0 for _ in values]
    min_x = min(clean_vals)
    max_x = max(clean_vals)
    return [normalize_value(v, min_x, max_x, direction) for v in values]
