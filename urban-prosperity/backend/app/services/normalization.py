from typing import Iterable, List, Literal, Sequence, Union
import numpy as np

def normalize_value(
    x: float,
    min_x: float,
    max_x: float,
    direction: Literal["positive", "negative"] = "positive"
) -> float:
    """
    Min-max normalization for individual values scaled to 0-100.
    
    Positive indicator:
        X_norm = 100 * (X - min(X)) / (max(X) - min(X))
        
    Negative indicator:
        X_norm = 100 * (1 - (X - min(X)) / (max(X) - min(X)))
        
    Edge case:
        If max_x == min_x, returns neutral midpoint (50.0).
    """
    if np.isclose(max_x, min_x):
        return 50.0

    # Guard against NaN/None
    if x is None or np.isnan(x):
        return 50.0

    if direction == "positive":
        normalized = 100.0 * (x - min_x) / (max_x - min_x)
    elif direction == "negative":
        normalized = 100.0 * (1.0 - (x - min_x) / (max_x - min_x))
    else:
        raise ValueError(f"Unsupported direction '{direction}'. Must be 'positive' or 'negative'.")

    # Clamp to [0, 100]
    return float(np.clip(normalized, 0.0, 100.0))


def normalize_series(
    values: Sequence[float],
    direction: Literal["positive", "negative"] = "positive"
) -> List[float]:
    """
    Normalize an entire sequence of indicator values across cities.
    Handles NaN values and max == min edge cases safely.
    """
    clean_vals = [v for v in values if v is not None and not np.isnan(v)]
    if not clean_vals:
        return [50.0 for _ in values]

    min_x = min(clean_vals)
    max_x = max(clean_vals)

    return [normalize_value(v, min_x, max_x, direction) for v in values]
