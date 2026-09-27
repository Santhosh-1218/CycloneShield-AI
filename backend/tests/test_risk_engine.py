import pytest
from app.risk.normalization import normalize_min_max, normalize_logarithmic
from app.risk.hazard import calculate_hazard_score
from app.risk.exposure import calculate_exposure_score
from app.risk.vulnerability import calculate_vulnerability_score
from app.risk.scoring import compute_overall_risk, categorize_risk

def test_normalization_bounds():
    assert normalize_min_max(50, 0, 100) == 0.5
    assert normalize_min_max(150, 0, 100) == 1.0
    assert normalize_min_max(-10, 0, 100) == 0.0
    assert normalize_min_max(None, 0, 100) == 0.5
    assert normalize_min_max(20, 0, 100, invert=True) == 0.8

def test_risk_scoring_formula():
    hazard = calculate_hazard_score(wind_speed_kmh=180, rainfall_24h_mm=250, central_pressure_hpa=950, storm_surge_m=3.5)
    exposure = calculate_exposure_score(population_density=8000, infrastructure_items=[{"type": "hospital"}, {"type": "shelter"}])
    vulnerability = calculate_vulnerability_score(elevation_m=4.0, coastal_distance_km=5.0)

    res = compute_overall_risk(hazard, exposure, vulnerability)

    assert 0.0 <= res["score"] <= 1.0
    assert res["category"] in ["Low", "Moderate", "High", "Very High"]
    assert len(res["explainable_factors"]) > 0

def test_categorize_risk():
    assert categorize_risk(0.10) == "Low"
    assert categorize_risk(0.35) == "Moderate"
    assert categorize_risk(0.60) == "High"
    assert categorize_risk(0.85) == "Very High"
