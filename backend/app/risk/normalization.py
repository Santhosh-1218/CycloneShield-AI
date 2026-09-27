import math
from typing import Optional

def normalize_min_max(val: Optional[float], min_val: float, max_val: float, invert: bool = False) -> float:
    """
    Min-Max normalization clamped to [0.0, 1.0].
    If invert is True, smaller values yield higher normalized scores (useful for elevation or distance to coast).
    Handles None, NaN, inf gracefully.
    """
    if val is None or math.isnan(val) or math.isinf(val):
        return 0.5  # Neutral default for missing data

    if max_val <= min_val:
        return 0.5

    clamped = max(min_val, min(max_val, float(val)))
    norm = (clamped - min_val) / (max_val - min_val)

    if invert:
        norm = 1.0 - norm

    return round(max(0.0, min(1.0, norm)), 4)

def normalize_logarithmic(val: Optional[float], max_expected: float) -> float:
    """
    Logarithmic scale normalization for skewed variables like population or density.
    """
    if val is None or math.isnan(val) or math.isinf(val) or val <= 0:
        return 0.0

    log_val = math.log1p(val)
    log_max = math.log1p(max_expected)
    if log_max <= 0:
        return 0.0

    norm = log_val / log_max
    return round(max(0.0, min(1.0, norm)), 4)
