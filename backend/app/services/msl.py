"""MSL (Moisture Sensitivity Level) computation service."""

from datetime import datetime


def compute_msl_status(reel) -> dict:
    """Compute dynamic remaining_hours and status for an MSL reel.

    If the reel has been opened, elapsed time is subtracted from floor_life_hours.
    Status thresholds:
      - expired:  remaining <= 0
      - critical: remaining < 10% of floor life
      - warning:  remaining < 25% of floor life
      - ok:       otherwise
    """
    if reel.opened_at:
        elapsed = (datetime.utcnow() - reel.opened_at).total_seconds() / 3600
        remaining = float(reel.floor_life_hours) - elapsed
    else:
        remaining = float(reel.floor_life_hours)

    if remaining <= 0:
        status = "expired"
    elif remaining / float(reel.floor_life_hours) < 0.10:
        status = "critical"
    elif remaining / float(reel.floor_life_hours) < 0.25:
        status = "warning"
    else:
        status = "ok"

    return {"remaining_hours": round(max(remaining, 0), 2), "status": status}
