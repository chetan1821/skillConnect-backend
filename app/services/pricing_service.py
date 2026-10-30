from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any


PLATFORM_FEE_DEFAULT = Decimal("29.00")
COMMISSION_RATE_DEFAULT = Decimal("0.10")  # 10%


def calculate_pricing(
    base_amount: Decimal | float | int,
    extra_amount: Decimal | float | int = Decimal("0.00"),
    platform_fee: Decimal | float | int = PLATFORM_FEE_DEFAULT,
    commission_rate: Decimal | float | int = COMMISSION_RATE_DEFAULT,
    tax_rate: Decimal | float | int = Decimal("0.00")
) -> Dict[str, Any]:
    """
    Production-grade pricing math engine using Python Decimal.
    
    Formula:
      - Service Subtotal = Base Amount + Extra Amount
      - Platform Commission = Service Subtotal * Commission Rate (10%)
      - Provider Net Payout = Service Subtotal - Platform Commission
      - Tax Amount = (Service Subtotal + Platform Fee) * Tax Rate
      - Total Customer Payable = Service Subtotal + Platform Fee + Tax Amount
    """
    b = Decimal(str(base_amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    e = Decimal(str(extra_amount)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    pf = Decimal(str(platform_fee)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    cr = Decimal(str(commission_rate))
    tr = Decimal(str(tax_rate))

    subtotal = b + e
    commission = (subtotal * cr).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    provider_payout = (subtotal - commission).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    
    tax = ((subtotal + pf) * tr).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total_customer = (subtotal + pf + tax).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return {
        "base_amount": float(b),
        "extra_amount": float(e),
        "platform_fee": float(pf),
        "tax_amount": float(tax),
        "platform_commission": float(commission),
        "provider_payout": float(provider_payout),
        "total_amount_numeric": float(total_customer),
        "formatted_total": f"₹{total_customer:,.2f}"
    }

