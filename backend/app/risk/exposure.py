from typing import Dict, Any, List, Optional
from app.risk.normalization import normalize_min_max, normalize_logarithmic

def calculate_exposure_score(
    population_density: float,
    infrastructure_items: List[Dict[str, Any]],
    built_up_ratio: Optional[float] = 0.5
) -> Dict[str, Any]:
    """
    Computes normalized Exposure Score E in range [0.0, 1.0].
    Weights:
      - Population density (0-15000): 0.40
      - Critical infrastructure density / count: 0.35
      - Built-up area ratio (0.0-1.0): 0.25
    """
    # 1. Population density norm (logarithmic due to high variance between rural/urban)
    pop_norm = normalize_logarithmic(population_density, max_expected=15000.0)

    # 2. Critical infrastructure weighting
    # High value assets like hospitals, emergency shelters, substations have higher weights
    asset_weight_map = {
        "hospital": 3.0,
        "clinic": 2.0,
        "shelter": 2.5,
        "evacuation_center": 3.0,
        "power": 2.5,
        "substation": 2.5,
        "school": 1.5,
        "bridge": 2.0,
        "road": 1.0
    }

    weighted_infra_sum = 0.0
    critical_count = 0

    for item in infrastructure_items:
        itype = str(item.get("type", "")).lower()
        w = asset_weight_map.get(itype, 1.0)
        weighted_infra_sum += w
        critical_count += 1

    # Max expected weighted sum for a high-exposure cell/area ~ 25.0
    infra_norm = normalize_min_max(weighted_infra_sum, min_val=0.0, max_val=25.0)

    # 3. Built up ratio (from satellite land cover or urban classification)
    built_norm = normalize_min_max(built_up_ratio if built_up_ratio is not None else 0.5, min_val=0.0, max_val=1.0)

    score = (0.40 * pop_norm) + (0.35 * infra_norm) + (0.25 * built_norm)
    score = round(max(0.0, min(1.0, score)), 4)

    return {
        "score": score,
        "sub_factors": {
            "population_density": population_density,
            "pop_norm": pop_norm,
            "infrastructure_count": critical_count,
            "weighted_infra_sum": weighted_infra_sum,
            "infra_norm": infra_norm,
            "built_up_ratio": built_up_ratio,
            "built_norm": built_norm
        }
    }
