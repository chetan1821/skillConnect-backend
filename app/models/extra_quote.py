from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class BookingExtraQuote(Base):
    __tablename__ = "booking_extra_quotes"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)

    title = Column(String(150), nullable=False)
    description = Column(String(500), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(30), default="PENDING", nullable=False)  # PENDING, APPROVED, REJECTED

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    booking = relationship("Booking", back_populates="extra_quotes")
    provider = relationship("Provider", foreign_keys=[provider_id])

