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


class ProviderWallet(Base):
    __tablename__ = "provider_wallets"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), unique=True, nullable=False)
    available_balance = Column(Numeric(12, 2), default=0.00, nullable=False)
    pending_balance = Column(Numeric(12, 2), default=0.00, nullable=False)
    total_withdrawn = Column(Numeric(12, 2), default=0.00, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    provider = relationship("Provider", foreign_keys=[provider_id])
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("provider_wallets.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)

    transaction_type = Column(String(50), nullable=False)  # CREDIT_PAYOUT, WITHDRAWAL, DISPUTE_ADJUSTMENT
    amount = Column(Numeric(10, 2), nullable=False)
    balance_after = Column(Numeric(12, 2), nullable=False)
    description = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    wallet = relationship("ProviderWallet", back_populates="transactions")
    provider = relationship("Provider", foreign_keys=[provider_id])
    booking = relationship("Booking", foreign_keys=[booking_id])

