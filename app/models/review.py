from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)

    rating = Column(Integer, nullable=False)  # 1 to 5
    title = Column(String(150), nullable=True)
    comment = Column(Text, nullable=False)
    tags = Column(String(255), nullable=True)  # e.g., "Punctual,Clean Work,Polite"

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    booking = relationship("Booking")
    customer = relationship("User", foreign_keys=[customer_id])
    provider = relationship("Provider", foreign_keys=[provider_id])
