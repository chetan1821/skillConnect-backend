from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class BookingCreate(BaseModel):
    provider_id: int
    category_id: int | None = None
    scheduled_date: str = Field(..., description="Date of appointment e.g. 2026-10-30")
    time_slot: str = Field(..., description="Time window e.g. Morning (9 AM - 12 PM)")
    service_address: str = Field(..., min_length=5, max_length=300)
    service_note: str | None = Field(default=None, max_length=1000)
    total_amount: str | None = None


class BookingStatusUpdate(BaseModel):
    status: str = Field(..., description="Accepted, Declined, In Progress, Completed, Cancelled")


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
    total_amount: str | None
    created_at: datetime | None

    # Enriched details for UI convenience
    customer_name: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    provider_business_name: str | None = None
    provider_name: str | None = None
    provider_phone: str | None = None
    category_name: str | None = None

    model_config = ConfigDict(from_attributes=True)

