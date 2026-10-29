from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ExtraQuoteCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    amount: float = Field(..., gt=0)


class ExtraQuoteResponse(BaseModel):
    id: int
    booking_id: int
    provider_id: int
    title: str
    description: str | None = None
    amount: float
    status: str
    created_at: datetime | None = None
    resolved_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ExtraQuoteAction(BaseModel):
    action: str = Field(..., description="APPROVE or REJECT")


class StartJobRequest(BaseModel):
    start_otp: str = Field(..., min_length=4, max_length=6)


class CompleteJobRequest(BaseModel):
    completion_otp: str = Field(..., min_length=4, max_length=6)


class BookingCreate(BaseModel):
    provider_id: int
    category_id: int | None = None
    scheduled_date: str = Field(..., description="Date of appointment e.g. 2026-10-30")
    time_slot: str = Field(..., description="Time window e.g. Morning (9 AM - 12 PM)")
    service_address: str = Field(..., min_length=5, max_length=300)
    service_note: str | None = Field(default=None, max_length=1000)
    base_amount: float | None = None
    total_amount: str | None = None


class BookingStatusUpdate(BaseModel):
    status: str = Field(..., description="Pending, Accepted, Declined, In Progress, Completed, Cancelled")
    cancellation_reason: str | None = None


class BookingResponse(BaseModel):
    id: int
    customer_id: int
    provider_id: int
    category_id: int | None
    scheduled_date: str
    time_slot: str
    service_address: str
    service_note: str | None
    status: str
    total_amount: str | None = None

    # Financial Ledger Fields
    base_amount: float | None = 0.00
    extra_amount: float | None = 0.00
    platform_fee: float | None = 29.00
    tax_amount: float | None = 0.00
    total_amount_numeric: float | None = 0.00
    provider_payout: float | None = 0.00
    platform_commission: float | None = 0.00
    payment_status: str | None = "IN_ESCROW"

    # Security & OTPs
    start_otp: str | None = None
    completion_otp: str | None = None
    cancellation_reason: str | None = None

    # Extra Quotes
    extra_quotes: list[ExtraQuoteResponse] = []

    created_at: datetime | None = None

    # Enriched details for UI convenience
    customer_name: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    provider_business_name: str | None = None
    provider_name: str | None = None
    provider_phone: str | None = None
    category_name: str | None = None

    model_config = ConfigDict(from_attributes=True)


class WalletTransactionResponse(BaseModel):
    id: int
    wallet_id: int
    provider_id: int
    booking_id: int | None = None
    transaction_type: str
    amount: float
    balance_after: float
    description: str | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ProviderWalletResponse(BaseModel):
    provider_id: int
    available_balance: float
    pending_balance: float
    total_withdrawn: float
    transactions: list[WalletTransactionResponse] = []

    model_config = ConfigDict(from_attributes=True)


class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0)
    bank_account_note: str | None = Field(default=None, max_length=200)
