"""TDS computation service tests — FY 2025-26 Indian income tax."""

import pytest
from app.services.tds import (
    compute_tds_new_regime,
    compute_tds_old_regime,
    compute_overtime,
    compare_regimes,
)


# ─── New Regime Tests ─────────────────────────────────────────────────────

def test_new_regime_below_taxable():
    """Income below 4L + 75K standard deduction = no tax."""
    result = compute_tds_new_regime(400_000)
    assert result["annual_tax"] == 0
    assert result["monthly_tds"] == 0
    assert result["regime"] == "new"


def test_new_regime_rebate_87a():
    """Taxable income under 12.75L gets full rebate."""
    result = compute_tds_new_regime(1_200_000)
    assert result["annual_tax"] == 0  # rebate applies


def test_new_regime_above_rebate():
    """Income above rebate threshold should have tax."""
    result = compute_tds_new_regime(1_800_000)
    assert result["annual_tax"] > 0
    assert result["monthly_tds"] > 0


def test_new_regime_high_income():
    """High income hits 30% slab."""
    result = compute_tds_new_regime(3_000_000)
    assert result["annual_tax"] > 200_000
    assert result["taxable_income"] == 3_000_000 - 75_000


def test_new_regime_standard_deduction():
    """Standard deduction is 75,000 in new regime."""
    result = compute_tds_new_regime(1_000_000)
    assert result["standard_deduction"] == 75_000
    assert result["taxable_income"] == 925_000


def test_new_regime_cess():
    """4% Health & Education Cess applied on tax."""
    result = compute_tds_new_regime(2_000_000)
    assert result["cess"] == pytest.approx(result["tax_before_cess"] * 0.04, abs=1)


# ─── Old Regime Tests ─────────────────────────────────────────────────────

def test_old_regime_below_threshold():
    """Income below 3L + deductions = no tax."""
    result = compute_tds_old_regime(300_000)
    assert result["annual_tax"] == 0


def test_old_regime_with_80c():
    """Section 80C deduction capped at 1.5L."""
    result = compute_tds_old_regime(1_000_000, section_80c=200_000)
    assert result["section_80c"] == 150_000  # capped


def test_old_regime_with_80d():
    """Section 80D deduction capped at 25K."""
    result = compute_tds_old_regime(1_000_000, section_80d=50_000)
    assert result["section_80d"] == 25_000  # capped


def test_old_regime_rebate():
    """Rebate u/s 87A if taxable <= 5L."""
    result = compute_tds_old_regime(500_000)
    assert result["annual_tax"] == 0  # rebate applies


def test_old_regime_standard_deduction():
    """Standard deduction is 50,000 in old regime."""
    result = compute_tds_old_regime(800_000)
    assert result["standard_deduction"] == 50_000


# ─── Overtime Tests ───────────────────────────────────────────────────────

def test_overtime_basic_calculation():
    """OT = hours * (basic/26/8) * 1.5"""
    # basic=30000, 10 hours: 30000/26/8 * 10 * 1.5 = 2163.46
    result = compute_overtime(30_000, 10, 1.5)
    assert result == pytest.approx(2163.46, abs=1)


def test_overtime_zero_hours():
    result = compute_overtime(30_000, 0)
    assert result == 0.0


def test_overtime_double_rate():
    result_1_5 = compute_overtime(30_000, 10, 1.5)
    result_2_0 = compute_overtime(30_000, 10, 2.0)
    assert result_2_0 > result_1_5


# ─── Regime Comparison ────────────────────────────────────────────────────

def test_compare_regimes():
    result = compare_regimes(1_500_000, section_80c=150_000, section_80d=25_000)
    assert "new_regime" in result
    assert "old_regime" in result
    assert result["recommended"] in ("new", "old")
    assert result["annual_savings"] >= 0


def test_compare_regimes_low_income():
    """At low income, both regimes should show 0 tax."""
    result = compare_regimes(400_000)
    assert result["new_regime"]["annual_tax"] == 0
    assert result["old_regime"]["annual_tax"] == 0
    assert result["annual_savings"] == 0
