import pytest
from app.services.normalization import normalize_value, normalize_series

def test_positive_normalization_standard():
    # Min 10, Max 50. Value 30 should be 50.0
    val = normalize_value(30.0, 10.0, 50.0, direction="positive")
    assert pytest.approx(val, 0.01) == 50.0

    # Min 10, Max 50. Value 10 should be 0.0
    assert pytest.approx(normalize_value(10.0, 10.0, 50.0, direction="positive"), 0.01) == 0.0

    # Min 10, Max 50. Value 50 should be 100.0
    assert pytest.approx(normalize_value(50.0, 10.0, 50.0, direction="positive"), 0.01) == 100.0

def test_negative_indicator_normalization():
    # For negative indicator (like PM2.5 or Crime Rate), lower raw value = higher normalized score
    # Min 10, Max 50. Value 10 should be 100.0
    val_best = normalize_value(10.0, 10.0, 50.0, direction="negative")
    assert pytest.approx(val_best, 0.01) == 100.0

    # Value 50 should be 0.0
    val_worst = normalize_value(50.0, 10.0, 50.0, direction="negative")
    assert pytest.approx(val_worst, 0.01) == 0.0

    # Value 30 should be 50.0
    val_mid = normalize_value(30.0, 10.0, 50.0, direction="negative")
    assert pytest.approx(val_mid, 0.01) == 50.0

def test_edge_case_max_equals_min():
    # When max == min, division by zero is guarded and returns neutral 50.0
    res_pos = normalize_value(25.0, 25.0, 25.0, direction="positive")
    assert res_pos == 50.0

    res_neg = normalize_value(25.0, 25.0, 25.0, direction="negative")
    assert res_neg == 50.0

def test_clamping_bounds():
    # Value above max should clamp to 100
    assert normalize_value(120.0, 0.0, 100.0, direction="positive") == 100.0
    # Value below min should clamp to 0
    assert normalize_value(-20.0, 0.0, 100.0, direction="positive") == 0.0

def test_normalize_series():
    series = [10.0, 20.0, 30.0, 40.0, 50.0]
    norm_pos = normalize_series(series, direction="positive")
    assert norm_pos[0] == 0.0
    assert norm_pos[-1] == 100.0
    assert norm_pos[2] == 50.0

    norm_neg = normalize_series(series, direction="negative")
    assert norm_neg[0] == 100.0
    assert norm_neg[-1] == 0.0
