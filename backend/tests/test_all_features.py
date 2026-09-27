import pytest
from unittest.mock import patch
from app.risk.normalization import normalize_min_max, normalize_logarithmic
from app.risk.hazard import calculate_hazard_score
from app.risk.exposure import calculate_exposure_score
from app.risk.vulnerability import calculate_vulnerability_score
from app.risk.scoring import compute_overall_risk, categorize_risk
from app.schemas.provenance import create_provenance
from app.services.safe_route_service import calculate_safe_evacuation_route
from app.services.parametric_service import evaluate_parametric_triggers
from app.services.cyclone_service import get_active_cyclones

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

def test_data_provenance_schema():
    prov = create_provenance(
        source="Test Source",
        provider="Test Provider",
        data_type="Test Data",
        retrieved_at="2026-09-27T10:00:00Z",
        status="LIVE",
        confidence=0.95
    )
    d = prov.model_dump()
    assert d["source"] == "Test Source"
    assert d["status"] == "LIVE"
    assert d["confidence"] == 0.95

@pytest.mark.asyncio
async def test_safe_route_evacuation():
    res = await calculate_safe_evacuation_route(16.9891, 82.2475)
    assert res["available"] is True
    assert res["distance_km"] > 0
    assert res["geojson"]["type"] == "Feature"
    assert len(res["geojson"]["geometry"]["coordinates"]) >= 2
    assert "provenance" in res

@pytest.mark.asyncio
async def test_parametric_monitor_triggers():
    res = await evaluate_parametric_triggers(16.9891, 82.2475)
    assert res["available"] is True
    assert res["trigger_status"] in ["NOT AT RISK", "WATCH", "HIGH PROBABILITY", "TRIGGERED"]
    assert len(res["metrics"]) == 3
    assert "provenance" in res

@pytest.mark.asyncio
async def test_cyclone_service_demo_and_no_active():
    demo_res = await get_active_cyclones(16.9891, 82.2475, demo_mode=True)
    assert demo_res["hasActiveCyclone"] is True
    assert demo_res["isDemoMode"] is True
    assert len(demo_res["geojson"]["features"]) > 0

    mock_live = {
        "available": True,
        "hasActiveCyclone": False,
        "status": "LIVE",
        "message": "NO ACTIVE CYCLONE DETECTED",
        "storm": None,
        "geojson": {"type": "FeatureCollection", "features": []}
    }
    with patch("app.services.cyclone_service.fetch_gdacs_active_cyclones", return_value=mock_live):
        live_res = await get_active_cyclones(16.9891, 82.2475, demo_mode=False)
        assert live_res["available"] is True
        assert "hasActiveCyclone" in live_res
