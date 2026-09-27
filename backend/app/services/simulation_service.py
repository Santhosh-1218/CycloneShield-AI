import math
from typing import Dict, Any, List, Optional
from app.risk.hazard import calculate_hazard_score
from app.risk.exposure import calculate_exposure_score
from app.risk.vulnerability import calculate_vulnerability_score
from app.risk.scoring import compute_overall_risk
from app.services.osm_service import fetch_infrastructure_nodes
from app.services.weather_service import get_current_weather

def estimate_coastal_distance_km(lat: float, lon: float) -> float:
    """
    Estimates distance to coastal waters for East/West Indian Coast & Bay of Bengal / Arabian Sea.
    Simplification based on lat/lon coordinates for fast calculation.
    """
    # Bay of Bengal Coast ~ 85.0E, East Coast ~ 13.0N to 21.0N
    # West Coast ~ 72.8E, 8.0N to 20.0N
    # Default calculation relative to nearest sea boundary
    if 8.0 <= lat <= 22.0:
        # Approximate distance to nearest ocean edge (72E on West, 88E on East)
        d_east = abs(lon - 87.0) * 111.0 * math.cos(math.radians(lat))
        d_west = abs(lon - 72.5) * 111.0 * math.cos(math.radians(lat))
        return min(d_east, d_west)
    return 25.0

async def run_hypothetical_simulation(
    center_lat: float,
    center_lon: float,
    wind_speed_kmh: float,
    rainfall_24h_mm: float,
    storm_surge_m: float,
    central_pressure_hpa: Optional[float] = 970.0,
    radius_km: float = 50.0
) -> Dict[str, Any]:
    """
    Runs a hypothetical cyclone simulation scenario against baseline geographic exposure.
    Returns side-by-side comparison of baseline vs simulated risk.
    """
    # 1. Fetch real infrastructure nodes near center
    infra_result = fetch_infrastructure_nodes(center_lat, center_lon, radius_m=int(radius_km * 1000))
    raw_nodes = infra_result.get("elements", []) if isinstance(infra_result, dict) else []

    infra_items = []
    for el in raw_nodes:
        tags = el.get("tags", {})
        amenity = tags.get("amenity", "")
        emergency = tags.get("emergency", "")
        power = tags.get("power", "")
        infra_type = "facility"
        if amenity in ["hospital", "clinic"]:
            infra_type = "hospital"
        elif amenity in ["school", "college"]:
            infra_type = "school"
        elif emergency or amenity == "shelter":
            infra_type = "shelter"
        elif power:
            infra_type = "power"

        infra_items.append({
            "id": el.get("id"),
            "lat": el.get("lat", center_lat),
            "lon": el.get("lon", center_lon),
            "name": tags.get("name", "Infrastructure Node"),
            "type": infra_type
        })

    # Base environmental factors
    coastal_dist = estimate_coastal_distance_km(center_lat, center_lon)
    # Estimate baseline elevation (approx 12m for coastal lowland default)
    base_elevation = 12.0
    est_pop_density = 3800.0  # Default regional density estimate (people/km²)

    # 2. Compute Baseline Risk (Current weather or standard baseline)
    current_weather = await get_current_weather(center_lat, center_lon)
    vals = current_weather.get("values") if isinstance(current_weather, dict) else None
    base_wind = vals.get("windSpeed", 25.0) if isinstance(vals, dict) else 25.0
    base_rain = vals.get("accumulatedRain24h", 10.0) if isinstance(vals, dict) else 10.0
    base_surge = 0.2

    h_base = calculate_hazard_score(base_wind, base_rain, 1010.0, base_surge)
    e_base = calculate_exposure_score(est_pop_density, infra_items, built_up_ratio=0.6)
    v_base = calculate_vulnerability_score(base_elevation, coastal_dist, road_density_km2=3.5)

    baseline_result = compute_overall_risk(h_base, e_base, v_base)

    # 3. Compute Simulated Risk under hypothetical scenario
    h_sim = calculate_hazard_score(wind_speed_kmh, rainfall_24h_mm, central_pressure_hpa, storm_surge_m)
    e_sim = calculate_exposure_score(est_pop_density, infra_items, built_up_ratio=0.6)
    v_sim = calculate_vulnerability_score(base_elevation, coastal_dist, road_density_km2=3.5)

    simulated_result = compute_overall_risk(h_sim, e_sim, v_sim)

    # 4. Generate spatial grid points across radius for map visualization
    grid_points = []
    grid_steps = 8
    step_deg = (radius_km / 111.0) / 4.0

    total_est_population = int(math.pi * (radius_km ** 2) * est_pop_density)
    affected_population = int(total_est_population * (simulated_result["score"]))

    for i in range(-2, 3):
        for j in range(-2, 3):
            pt_lat = round(center_lat + (i * step_deg), 4)
            pt_lon = round(center_lon + (j * step_deg), 4)
            dist_from_center = math.sqrt((i*15)**2 + (j*15)**2)

            # Wind/Rain drops slightly with distance from eye center
            decay = max(0.4, 1.0 - (dist_from_center / 100.0))
            pt_h = calculate_hazard_score(wind_speed_kmh * decay, rainfall_24h_mm * decay, central_pressure_hpa, storm_surge_m * decay)
            pt_risk = compute_overall_risk(pt_h, e_sim, v_sim)

            grid_points.append({
                "lat": pt_lat,
                "lon": pt_lon,
                "score": pt_risk["score"],
                "category": pt_risk["category"],
                "wind_speed": round(wind_speed_kmh * decay, 1),
                "rainfall": round(rainfall_24h_mm * decay, 1)
            })

    # Delta analysis
    risk_delta = round(simulated_result["score"] - baseline_result["score"], 4)

    return {
        "status": "success",
        "scenario": {
            "center": {"lat": center_lat, "lon": center_lon},
            "radius_km": radius_km,
            "wind_speed_kmh": wind_speed_kmh,
            "rainfall_24h_mm": rainfall_24h_mm,
            "storm_surge_m": storm_surge_m,
            "central_pressure_hpa": central_pressure_hpa
        },
        "baseline_risk": {
            "score": baseline_result["score"],
            "category": baseline_result["category"],
            "hazard_score": baseline_result["hazard_score"],
            "exposure_score": baseline_result["exposure_score"],
            "vulnerability_score": baseline_result["vulnerability_score"]
        },
        "simulated_risk": {
            "score": simulated_result["score"],
            "category": simulated_result["category"],
            "hazard_score": simulated_result["hazard_score"],
            "exposure_score": simulated_result["exposure_score"],
            "vulnerability_score": simulated_result["vulnerability_score"],
            "explainable_factors": simulated_result["explainable_factors"]
        },
        "impact_delta": {
            "risk_score_increase": max(0.0, risk_delta),
            "category_change": f"{baseline_result['category']} -> {simulated_result['category']}",
            "estimated_exposed_population": affected_population,
            "total_area_population": total_est_population,
            "critical_facilities_count": len(infra_items)
        },
        "spatial_grid": grid_points,
        "infrastructure_at_risk": infra_items[:10],
        "metadata": {
            "source": "CycloneShield Impact Engine v3",
            "disclaimer": "Scenario estimate for decision support. Not an official agency forecast."
        }
    }
