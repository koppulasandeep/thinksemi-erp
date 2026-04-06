"""Pure unit tests for MSL status computation service."""

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from app.services.msl import compute_msl_status


def _reel(floor_life_hours, opened_hours_ago=None):
    opened = None
    if opened_hours_ago is not None:
        opened = datetime.now(timezone.utc) - timedelta(hours=opened_hours_ago)
    return SimpleNamespace(
        floor_life_hours=floor_life_hours,
        opened_at=opened,
    )


def test_unopened_reel_is_ok():
    result = compute_msl_status(_reel(168))
    assert result["status"] == "ok"
    assert result["remaining_hours"] == 168.0


def test_recently_opened_reel_is_ok():
    result = compute_msl_status(_reel(168, opened_hours_ago=1))
    assert result["status"] == "ok"
    assert result["remaining_hours"] > 166


def test_warning_threshold():
    # 20% remaining of 168 = 33.6 hours, so opened 134 hours ago
    result = compute_msl_status(_reel(168, opened_hours_ago=134))
    assert result["status"] == "warning"


def test_critical_threshold():
    # 5% remaining of 168 = 8.4 hours, so opened 160 hours ago
    result = compute_msl_status(_reel(168, opened_hours_ago=160))
    assert result["status"] == "critical"


def test_expired_reel():
    result = compute_msl_status(_reel(168, opened_hours_ago=200))
    assert result["status"] == "expired"
    assert result["remaining_hours"] == 0


def test_boundary_above_25_percent_is_ok():
    # 30% remaining (50.4 of 168) — above 25% threshold
    result = compute_msl_status(_reel(168, opened_hours_ago=117))
    assert result["status"] == "ok"


def test_boundary_between_10_and_25_is_warning():
    # 15% remaining (25.2 of 168) — between 10% and 25%
    result = compute_msl_status(_reel(168, opened_hours_ago=143))
    assert result["status"] == "warning"


def test_naive_datetime_handled():
    """opened_at without timezone info should still work."""
    reel = SimpleNamespace(
        floor_life_hours=100,
        opened_at=datetime.utcnow() - timedelta(hours=10),  # naive
    )
    result = compute_msl_status(reel)
    assert result["status"] == "ok"
    assert result["remaining_hours"] > 89
