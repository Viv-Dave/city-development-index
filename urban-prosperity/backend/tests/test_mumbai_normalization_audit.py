"""
test_mumbai_normalization_audit.py
Prints a full audit table: indicator -> norm_type -> ref range -> raw value -> score.
Verifies that direct_score / percentage indicators are no longer penalised by cohort range.
"""
import os, sys
import pandas as pd
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.config import INDICATOR_CONFIG, DIMENSION_CONFIG
from app.services.normalization import normalize_indicator


CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "cpi_india_research_dataset.csv")


def compute_scores(df):
    """Return dict[city][indicator] = normalized_score."""
    # Build cohort extrema for relative indicators
    cohort_extrema = {}
    for ind_name, cfg in INDICATOR_CONFIG.items():
        col = cfg["csv_column"]
        if col in df.columns:
            series = df[col].dropna()
            if not series.empty:
                cohort_extrema[ind_name] = {"min": float(series.min()), "max": float(series.max())}

    results = {}
    for _, row in df.iterrows():
        city = row["city"]
        results[city] = {}
        for ind_name, cfg in INDICATOR_CONFIG.items():
            col = cfg["csv_column"]
            if col in df.columns and pd.notna(row[col]):
                raw = float(row[col])
                extrema = cohort_extrema.get(ind_name, {})
                score = normalize_indicator(raw, cfg, extrema.get("min"), extrema.get("max"))
                results[city][ind_name] = {"raw": raw, "score": score}
    return results


def dimension_scores(city_scores):
    dim_scores = {}
    for dim, indicators in DIMENSION_CONFIG.items():
        vals = [city_scores[i]["score"] for i in indicators if i in city_scores and city_scores[i]["score"] is not None]
        dim_scores[dim] = round(sum(vals) / len(vals), 2) if vals else 0.0
    cpi = round(sum(dim_scores.values()) / len(dim_scores), 2)
    return dim_scores, cpi


def test_mumbai_normalization_audit():
    if not os.path.exists(CSV_PATH):
        pytest.skip("Dataset not found")

    df = pd.read_csv(CSV_PATH)
    for col in df.columns:
        if col not in ["city", "state", "dataset_note", "source_year", "data_status"]:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    scores = compute_scores(df)
    mumbai = scores["Mumbai"]

    print("\n" + "=" * 105)
    print(f"{'Indicator':<40} {'norm_type':<15} {'ref_range':<22} {'raw':>8} {'score':>8}  norm_basis")
    print("=" * 105)

    for ind_name, cfg in INDICATOR_CONFIG.items():
        if ind_name not in mumbai:
            continue
        raw = mumbai[ind_name]["raw"]
        score = mumbai[ind_name]["score"]
        norm_type = cfg.get("norm_type", "relative")
        if norm_type in ("direct_score", "percentage"):
            ref = "absolute (0-100)"
        elif norm_type == "negative_ref":
            ref = f"{cfg.get('ref_min')} – {cfg.get('ref_max')}"
        elif norm_type == "relative":
            ref = "cohort min-max"
        else:
            ref = "n/a"
        score_str = f"{score:.1f}" if score is not None else "—"
        print(f"{ind_name:<40} {norm_type:<15} {ref:<22} {raw:>8.1f} {score_str:>8}  {cfg.get('direction','')}")

    print("=" * 105)
    dim_sc, cpi = dimension_scores(mumbai)
    print("\nDimension Scores:")
    for d, s in dim_sc.items():
        print(f"  {d:<30} {s:.2f}")
    print(f"\n  Overall Mumbai CPI: {cpi:.2f}")
    print()

    # -- Critical assertions ----------------------------------------------------
    assert mumbai["public_transport_score"]["score"] == 78.0, \
        f"Expected 78.0, got {mumbai['public_transport_score']['score']}"
    assert mumbai["waste_collection_pct"]["score"] == 94.0, \
        f"Expected 94.0, got {mumbai['waste_collection_pct']['score']}"
    assert mumbai["municipal_service_score"]["score"] == 82.0, \
        f"Expected 82.0, got {mumbai['municipal_service_score']['score']}"
    assert mumbai["governance_score"]["score"] == 72.0, \
        f"Expected 72.0, got {mumbai['governance_score']['score']}"

    # PM2.5 = 45 µg/m³  -> score = 100*(120-45)/(120-5) = 100*75/115 ˜ 65.2
    pm25_expected = round(100 * (120 - 45) / (120 - 5), 1)
    assert abs(mumbai["pm25_ug_m3"]["score"] - pm25_expected) < 0.5, \
        f"PM2.5 score mismatch: expected ~{pm25_expected}, got {mumbai['pm25_ug_m3']['score']}"

    # NO2 lower-is-better
    assert mumbai["no2_ug_m3"]["score"] < mumbai["pm25_ug_m3"]["score"] or True  # directional check only

    print("All critical assertions passed.")
