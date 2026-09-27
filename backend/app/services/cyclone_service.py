import time
import logging
from typing import Dict, Any
from app.services.gdacs_service import fetch_gdacs_active_cyclones
from app.services.demo_service import get_demo_cyclone_scenario

logger = logging.getLogger("cycloneshield-cyclone")

_CYCLONE_CACHE: Dict[str, Any] = {
    "timestamp": 0,
    "data": None
}
CACHE_TTL_SECONDS = 300  # 5 minutes cache

async def get_active_cyclones(lat: float = 16.9891, lon: float = 82.2475, demo_mode: bool = False) -> Dict[str, Any]:
    """
    Retrieves canonical active tropical cyclone information.
    PRIMARY AUTHORITATIVE LIVE PROVIDER: GDACS (Global Disaster Alert and Coordination System).
    
    - If demo_mode is True, returns realistic demonstration storm scenario.
    - If no active cyclone exists in LIVE mode, returns 'NO ACTIVE CYCLONE DETECTED'.
    - If GDACS provider fails, returns status='UNAVAILABLE' and message='CYCLONE DATA UNAVAILABLE'.
    - NEVER fabricates fake storm tracks or coordinates in live mode.
    """
    retrieved_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # Demo mode isolation
    if demo_mode:
        return get_demo_cyclone_scenario(lat, lon)

    # Check in-memory cache for LIVE mode
    now = time.time()
    if _CYCLONE_CACHE["data"] is not None and (now - _CYCLONE_CACHE["timestamp"]) < CACHE_TTL_SECONDS:
        cached = dict(_CYCLONE_CACHE["data"])
        cached["retrievedAt"] = retrieved_at
        return cached

    # Fetch live cyclone data directly from GDACS primary provider
    gdacs_result = await fetch_gdacs_active_cyclones()

    _CYCLONE_CACHE["timestamp"] = now
    _CYCLONE_CACHE["data"] = gdacs_result
    return gdacs_result
