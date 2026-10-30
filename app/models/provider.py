from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    String,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.sql import func

from app.database.database import Base


class Provider(Base):
    __tablename__ = "providers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    business_name = Column(
        String(150),
        nullable=False
    )

    description = Column(
        String(500),
        nullable=True
    )

    experience_years = Column(
        Integer,
        default=0,
        nullable=False
    )

    visiting_fee = Column(
        Numeric(10, 2),
        default=199.00,
        nullable=False
    )

    hourly_rate = Column(
        Numeric(10, 2),
        default=300.00,
        nullable=False
    )

    is_verified = Column(
        Boolean,
        default=False,
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
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
