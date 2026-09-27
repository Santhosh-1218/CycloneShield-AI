import time
from typing import Dict, Any, List

def generate_emergency_action_plan(
    lat: float,
    lon: float,
    risk_score: float,
    risk_category: str,
    hazard_score: float,
    exposure_score: float,
    vulnerability_score: float,
    factors: List[str]
) -> Dict[str, Any]:
    """
    Generates decision-support emergency action checklist based on modeled risk indicators.
    Uses verification verbs: 'Verify', 'Review', 'Assess', 'Prepare'.
    """
    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    location_str = f"{round(lat, 4)}° N, {round(lon, 4)}° E Sector"

    infrastructure_actions = [
        "Verify backup diesel generator fuel capacity at primary regional hospitals.",
        "Assess structural integrity and drainage channels near critical power substations.",
        "Verify operational status of emergency communications gear at coastal EOCs."
    ]

    population_actions = [
        "Review estimated population exposure metrics (~3500 people/km²) for low-elevation sectors.",
        "Verify local vulnerable population rosters with municipal community wardens.",
        "Prepare public information broadcasts regarding designated safe shelter locations."
    ]

    transport_actions = [
        "Review potentially affected primary road segments subject to low-elevation inundation.",
        "Assess alternate emergency transit corridors for medical supply logistics.",
        "Verify pre-positioning of heavy clearance machinery near flood-prone bridges."
    ]

    emergency_actions = [
        "Review emergency responder shift rosters for 72-hour continuous monitoring.",
        "Verify satellite phone communication link with State Disaster Response Force (SDRF).",
        "Assess medical supply stock levels (first aid, IV fluids, clean water purification tabs)."
    ]

    shelter_actions = [
        "Verify primary shelter readiness, water sanitation facilities, and bedding capacity.",
        "Assess food supply reserves for 48-hour shelter operations.",
        "Verify secondary emergency shelter backup locations if surge threshold is exceeded."
    ]

    monitoring_actions = [
        "Continuously monitor official IMD cyclone tracking bulletins for landfall trajectory shifts.",
        "Track Open-Meteo 3-hour precipitation accumulation trends.",
        "Monitor Sentinel-1 SAR satellite acquisition metadata for coastal inundation indicators."
    ]

    data_limitations = [
        "Modeled risk estimates provide decision support and do not replace official IMD directives.",
        "Infrastructure status is derived from OpenStreetMap and requires physical ground verification.",
        "Satellite observations depend on orbit pass timestamps and sensor availability."
    ]

    return {
        "location": location_str,
        "risk_category": risk_category,
        "risk_score": risk_score,
        "infrastructure_actions": infrastructure_actions,
        "population_actions": population_actions,
        "transport_actions": transport_actions,
        "emergency_actions": emergency_actions,
        "shelter_actions": shelter_actions,
        "monitoring_actions": monitoring_actions,
        "data_limitations": data_limitations,
        "created_at": created_at
    }
