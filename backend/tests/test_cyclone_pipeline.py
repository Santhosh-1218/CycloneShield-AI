import pytest
from unittest.mock import patch, AsyncMock
from app.services.gdacs_service import normalize_gdacs_cyclone_response, fetch_gdacs_active_cyclones
from app.services.cyclone_service import get_active_cyclones

def test_gdacs_normalization_no_active_cyclones():
    raw_data = {"type": "FeatureCollection", "features": []}
    res = normalize_gdacs_cyclone_response(raw_data, "2026-09-28T00:00:00Z")
    assert res["available"] is True
    assert res["hasActiveCyclone"] is False
    assert res["status"] == "LIVE"
    assert res["message"] == "NO ACTIVE CYCLONE DETECTED"
    assert res["geojson"]["features"] == []

def test_gdacs_normalization_active_cyclone():
    raw_data = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [88.5, 18.2]},
                "properties": {
                    "iscurrent": "true",
                    "eventtype": "TC",
                    "eventid": "10001",
                    "eventname": "TEST_CYCLONE",
                    "alertlevel": "Red",
                    "country": "India"
                }
            }
        ]
    }
    res = normalize_gdacs_cyclone_response(raw_data, "2026-09-28T00:00:00Z")
    assert res["available"] is True
    assert res["hasActiveCyclone"] is True
    assert res["status"] == "LIVE"
    assert res["storm"]["name"] == "TEST_CYCLONE"
    assert res["storm"]["currentPosition"] == {"lat": 18.2, "lon": 88.5}

def test_gdacs_normalization_malformed_json():
    res = normalize_gdacs_cyclone_response("Not a dict", "2026-09-28T00:00:00Z")
    assert res["available"] is False
    assert res["hasActiveCyclone"] is False
    assert res["status"] == "UNAVAILABLE"

@pytest.mark.asyncio
async def test_gdacs_http_429_rate_limit():
    mock_resp = AsyncMock()
    mock_resp.status_code = 429

    with patch("httpx.AsyncClient.get", return_value=mock_resp):
        res = await fetch_gdacs_active_cyclones()
        assert res["available"] is False
        assert res["status"] == "UNAVAILABLE"
        assert "HTTP 429" in res["reason"]

@pytest.mark.asyncio
async def test_gdacs_http_500_server_error():
    mock_resp = AsyncMock()
    mock_resp.status_code = 500

    with patch("httpx.AsyncClient.get", return_value=mock_resp):
        res = await fetch_gdacs_active_cyclones()
        assert res["available"] is False
        assert res["status"] == "UNAVAILABLE"
        assert "HTTP 500" in res["reason"]

@pytest.mark.asyncio
async def test_gdacs_network_dns_failure():
    with patch("httpx.AsyncClient.get", side_effect=Exception("Temporary failure in name resolution")):
        res = await fetch_gdacs_active_cyclones()
        assert res["available"] is False
        assert res["hasActiveCyclone"] is False
        assert res["status"] == "UNAVAILABLE"
        assert "connection error" in res["reason"].lower()

@pytest.mark.asyncio
async def test_cyclone_service_live_mocked():
    mock_payload = {
        "available": True,
        "hasActiveCyclone": False,
        "status": "LIVE",
        "message": "NO ACTIVE CYCLONE DETECTED",
        "storm": None,
        "geojson": {"type": "FeatureCollection", "features": []},
        "forecastPoints": []
    }
    with patch("app.services.cyclone_service.fetch_gdacs_active_cyclones", return_value=mock_payload):
        res = await get_active_cyclones(16.98, 82.25, demo_mode=False)
        assert res["available"] is True
        assert res["hasActiveCyclone"] is False
        assert len(res["geojson"]["features"]) == 0

@pytest.mark.asyncio
async def test_cyclones_demo_mode_canonical_schema():
    res = await get_active_cyclones(lat=16.98, lon=82.25, demo_mode=True)
    assert res["available"] is True
    assert res["hasActiveCyclone"] is True
    assert res["isDemoMode"] is True
    assert res["storm"] is not None
    assert res["storm"]["name"] == "MOCHA (Demo Scenario)"
    assert len(res["forecastPoints"]) > 0
    assert len(res["geojson"]["features"]) > 0
    assert "provenance" in res
