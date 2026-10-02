import os, sys, pandas as pd
sys.path.insert(0, ".")
from app.config import INDICATOR_CONFIG, DIMENSION_CONFIG
from app.services.normalization import normalize_indicator

df = pd.read_csv("data/cpi_india_research_dataset.csv")
for col in df.columns:
    if col not in ["city","state","dataset_note","source_year","data_status"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

cohort_extrema = {}
for ind_name, cfg in INDICATOR_CONFIG.items():
    col = cfg["csv_column"]
    if col in df.columns:
        series = df[col].dropna()
        if not series.empty:
            cohort_extrema[ind_name] = {"min": float(series.min()), "max": float(series.max())}

mumbai_row = df[df["city"]=="Mumbai"].iloc[0]
mumbai = {}
for ind_name, cfg in INDICATOR_CONFIG.items():
    col = cfg["csv_column"]
    if col in df.columns and pd.notna(mumbai_row[col]):
        raw = float(mumbai_row[col])
        extrema = cohort_extrema.get(ind_name, {})
        score = normalize_indicator(raw, cfg, extrema.get("min"), extrema.get("max"))
        mumbai[ind_name] = {"raw": raw, "score": score}

print(f"{'Indicator':<40} {'norm_type':<15} {'ref_range':<22} {'raw':>10} {'score':>8}")
print("="*100)
for ind_name, cfg in INDICATOR_CONFIG.items():
    if ind_name not in mumbai:
        continue
    raw = mumbai[ind_name]["raw"]
    score = mumbai[ind_name]["score"]
    norm_type = cfg.get("norm_type", "relative")
    if norm_type in ("direct_score", "percentage"):
        ref = "absolute (0-100)"
    elif norm_type == "negative_ref":
        ref = f"{cfg.get('ref_min')} - {cfg.get('ref_max')}"
    elif norm_type == "relative":
        ref = "cohort min-max"
    else:
        ref = "n/a (contextual)"
    score_str = f"{score:.1f}" if score is not None else "--"
    print(f"{ind_name:<40} {norm_type:<15} {ref:<22} {raw:>10.1f} {score_str:>8}")

print()
dim_scores = {}
for dim, indicators in DIMENSION_CONFIG.items():
    vals = [mumbai[i]["score"] for i in indicators if i in mumbai and mumbai[i]["score"] is not None]
    dim_scores[dim] = round(sum(vals)/len(vals), 2) if vals else 0.0
    print(f"  {dim:<30} {dim_scores[dim]:.2f}")
cpi = round(sum(dim_scores.values())/len(dim_scores), 2)
print(f"  Overall CPI: {cpi:.2f}")

assert mumbai["public_transport_score"]["score"] == 78.0, f"FAIL public_transport: {mumbai['public_transport_score']['score']}"
assert mumbai["waste_collection_pct"]["score"] == 94.0, f"FAIL waste_collection: {mumbai['waste_collection_pct']['score']}"
assert mumbai["municipal_service_score"]["score"] == 82.0, f"FAIL municipal_service: {mumbai['municipal_service_score']['score']}"
assert mumbai["governance_score"]["score"] == 72.0, f"FAIL governance_score: {mumbai['governance_score']['score']}"
pm25_expected = round(100*(120-45)/(120-5), 2)
assert abs(mumbai["pm25_ug_m3"]["score"] - pm25_expected) < 0.5, f"FAIL pm25: expected ~{pm25_expected}, got {mumbai['pm25_ug_m3']['score']}"
print("\nAll assertions PASSED")
