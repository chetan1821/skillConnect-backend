from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base
from app.models.enums import BookingStatus


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    provider_id = Column(
        Integer,
        ForeignKey("providers.id"),
        nullable=False
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=True
    )

    scheduled_date = Column(
        String(50),
        nullable=False
    )

    time_slot = Column(
        String(100),
        nullable=False
    )

    service_address = Column(
        String(300),
        nullable=False
    )

    service_note = Column(
        String(1000),
        nullable=True
    )

    status = Column(
        String(30),
        nullable=False,
        default=BookingStatus.PENDING.value
    )

    total_amount = Column(
        String(50),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id])
    provider = relationship("Provider", foreign_keys=[provider_id])
    category = relationship("Category", foreign_keys=[category_id])

