"""Indian Income Tax (TDS) computation — FY 2025-26."""

import math


def compute_tds_new_regime(annual_gross: float) -> dict:
    """Compute TDS under new tax regime (FY 2025-26).

    Slabs: 0-4L nil, 4-8L 5%, 8-12L 10%, 12-16L 15%, 16-20L 20%, 20-24L 25%, >24L 30%
    Standard deduction: 75,000
    Rebate u/s 87A: No tax if taxable income <= 12,75,000
    4% Health & Education Cess
    """
    standard_deduction = 75_000
    taxable = max(annual_gross - standard_deduction, 0)

    slabs = [
        (400_000, 0.00),
        (400_000, 0.05),
        (400_000, 0.10),
        (400_000, 0.15),
        (400_000, 0.20),
        (400_000, 0.25),
        (math.inf, 0.30),
    ]

    tax = _apply_slabs(taxable, slabs)

    # Rebate u/s 87A: no tax if taxable income <= 12,75,000
    if taxable <= 1_275_000:
        tax = 0

    cess = round(tax * 0.04, 2)
    total_tax = round(tax + cess, 2)
    monthly_tds = round(total_tax / 12, 2)

    return {
        "regime": "new",
        "annual_gross": round(annual_gross, 2),
        "standard_deduction": standard_deduction,
        "taxable_income": round(taxable, 2),
        "tax_before_cess": round(tax, 2),
        "cess": cess,
        "annual_tax": total_tax,
        "monthly_tds": monthly_tds,
    }


def compute_tds_old_regime(
    annual_gross: float,
    section_80c: float = 0,
    section_80d: float = 0,
    hra_exemption: float = 0,
    home_loan_interest: float = 0,
    other_deductions: float = 0,
) -> dict:
    """Compute TDS under old tax regime (FY 2025-26).

    Slabs: 0-3L nil, 3-7L 5%, 7-10L 10%, 10-12L 15%, 12-15L 20%, >15L 30%
    Standard deduction: 50,000
    Section 80C capped at 1,50,000
    Section 80D capped at 25,000
    Rebate u/s 87A: No tax if taxable <= 5,00,000
    4% Health & Education Cess
    """
    standard_deduction = 50_000

    # Cap deductions
    sec_80c = min(section_80c, 150_000)
    sec_80d = min(section_80d, 25_000)
    home_loan = min(home_loan_interest, 200_000)  # Section 24b cap

    total_deductions = (
        standard_deduction + sec_80c + sec_80d + hra_exemption + home_loan + other_deductions
    )
    taxable = max(annual_gross - total_deductions, 0)

    slabs = [
        (300_000, 0.00),
        (400_000, 0.05),
        (300_000, 0.10),
        (200_000, 0.15),
        (300_000, 0.20),
        (math.inf, 0.30),
    ]

    tax = _apply_slabs(taxable, slabs)

    # Rebate u/s 87A: no tax if taxable <= 5,00,000
    if taxable <= 500_000:
        tax = 0

    cess = round(tax * 0.04, 2)
    total_tax = round(tax + cess, 2)
    monthly_tds = round(total_tax / 12, 2)

    return {
        "regime": "old",
        "annual_gross": round(annual_gross, 2),
        "standard_deduction": standard_deduction,
        "section_80c": sec_80c,
        "section_80d": sec_80d,
        "hra_exemption": round(hra_exemption, 2),
        "home_loan_interest": home_loan,
        "other_deductions": round(other_deductions, 2),
        "total_deductions": round(total_deductions, 2),
        "taxable_income": round(taxable, 2),
        "tax_before_cess": round(tax, 2),
        "cess": cess,
        "annual_tax": total_tax,
        "monthly_tds": monthly_tds,
    }


def compute_overtime(basic_monthly: float, ot_hours: float, multiplier: float = 1.5) -> float:
    """Compute overtime pay.

    Formula: ot_hours * (basic / 26 days / 8 hours) * multiplier
    """
    if ot_hours <= 0 or basic_monthly <= 0:
        return 0.0
    hourly_rate = basic_monthly / 26 / 8
    return round(ot_hours * hourly_rate * multiplier, 2)


def compare_regimes(
    annual_gross: float,
    section_80c: float = 0,
    section_80d: float = 0,
    hra_exemption: float = 0,
    home_loan_interest: float = 0,
    other_deductions: float = 0,
) -> dict:
    """Compare old vs new regime and recommend the better one."""
    new = compute_tds_new_regime(annual_gross)
    old = compute_tds_old_regime(
        annual_gross, section_80c, section_80d,
        hra_exemption, home_loan_interest, other_deductions,
    )
    recommended = "new" if new["annual_tax"] <= old["annual_tax"] else "old"
    savings = abs(new["annual_tax"] - old["annual_tax"])

    return {
        "new_regime": new,
        "old_regime": old,
        "recommended": recommended,
        "annual_savings": round(savings, 2),
    }


def _apply_slabs(taxable: float, slabs: list[tuple[float, float]]) -> float:
    """Apply progressive tax slabs to taxable income."""
    tax = 0.0
    remaining = taxable
    for slab_amount, rate in slabs:
        if remaining <= 0:
            break
        applicable = min(remaining, slab_amount)
        tax += applicable * rate
        remaining -= applicable
    return round(tax, 2)
