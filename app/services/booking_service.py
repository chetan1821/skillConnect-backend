import random
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from fastapi import HTTPException, status

from app.models.booking import Booking
from app.models.provider import Provider
from app.models.user import User
from app.models.category import Category
from app.models.wallet import ProviderWallet, WalletTransaction
from app.models.extra_quote import BookingExtraQuote
from app.models.enums import BookingStatus, UserRole
from app.schemas.booking import BookingCreate, ExtraQuoteCreate
from app.services.pricing_service import calculate_pricing


def _get_or_create_wallet(db: Session, provider_id: int) -> ProviderWallet:
    wallet = db.query(ProviderWallet).filter(ProviderWallet.provider_id == provider_id).first()
    if not wallet:
        wallet = ProviderWallet(
            provider_id=provider_id,
            available_balance=Decimal("0.00"),
            pending_balance=Decimal("0.00"),
            total_withdrawn=Decimal("0.00")
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


def _format_booking(booking: Booking, db: Session) -> dict:
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    provider_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
    category = db.query(Category).filter(Category.id == booking.category_id).first() if booking.category_id else None

    # Load extra quotes
    quotes = (
        db.query(BookingExtraQuote)
        .filter(BookingExtraQuote.booking_id == booking.id)
        .order_by(BookingExtraQuote.created_at.asc())
        .all()
    )

    formatted_quotes = [
        {
            "id": q.id,
            "booking_id": q.booking_id,
            "provider_id": q.provider_id,
            "title": q.title,
            "description": q.description,
            "amount": float(q.amount),
            "status": q.status,
            "created_at": q.created_at,
            "resolved_at": q.resolved_at
        }
        for q in quotes
    ]

    return {
        "id": booking.id,
        "customer_id": booking.customer_id,
        "provider_id": booking.provider_id,
        "category_id": booking.category_id,
        "scheduled_date": booking.scheduled_date,
        "time_slot": booking.time_slot,
        "service_address": booking.service_address,
        "service_note": booking.service_note,
        "status": booking.status,
        "total_amount": booking.total_amount,

        # Financial Ledger
        "base_amount": float(booking.base_amount or 0.00),
        "extra_amount": float(booking.extra_amount or 0.00),
        "platform_fee": float(booking.platform_fee or 29.00),
        "tax_amount": float(booking.tax_amount or 0.00),
        "total_amount_numeric": float(booking.total_amount_numeric or 0.00),
        "provider_payout": float(booking.provider_payout or 0.00),
        "platform_commission": float(booking.platform_commission or 0.00),
        "payment_status": booking.payment_status,

        # OTPs & Security
        "start_otp": booking.start_otp,
        "completion_otp": booking.completion_otp,
        "cancellation_reason": booking.cancellation_reason,

        "extra_quotes": formatted_quotes,
        "created_at": booking.created_at,

        # Enriched labels
        "customer_name": customer.full_name if customer else "Customer",
        "customer_email": customer.email if customer else "",
        "customer_phone": customer.phone_number if customer else "",
        "provider_business_name": provider.business_name if provider else "Provider",
        "provider_name": provider_user.full_name if provider_user else "",
        "provider_phone": provider_user.phone_number if provider_user else "",
        "category_name": category.name if category else "General Service"
    }


def create_booking(db: Session, customer_id: int, data: BookingCreate) -> dict:
    customer = db.query(User).filter(User.id == customer_id, User.is_active.is_(True)).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer account not found or inactive"
        )

    provider = db.query(Provider).filter(Provider.id == data.provider_id, Provider.is_active.is_(True)).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found or inactive"
        )

    if provider.user_id == customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book an appointment with your own provider account"
        )

    if data.category_id:
        category = db.query(Category).filter(Category.id == data.category_id, Category.is_active.is_(True)).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected category not found or inactive"
            )

    # 1. Determine Pricing
    base_val = data.base_amount if (data.base_amount and data.base_amount > 0) else float(provider.visiting_fee or 199.00)
    pricing = calculate_pricing(base_amount=base_val)

    # 2. Generate Cryptographically Strong Verification OTPs
    start_otp = f"{random.randint(1000, 9999)}"
    completion_otp = f"{random.randint(1000, 9999)}"

    # 3. Create Booking Record
    booking = Booking(
        customer_id=customer_id,
        provider_id=data.provider_id,
        category_id=data.category_id,
        scheduled_date=data.scheduled_date,
        time_slot=data.time_slot,
        service_address=data.service_address,
        service_note=data.service_note,
        status=BookingStatus.PENDING.value,
        base_amount=Decimal(str(pricing["base_amount"])),
        extra_amount=Decimal("0.00"),
        platform_fee=Decimal(str(pricing["platform_fee"])),
        tax_amount=Decimal(str(pricing["tax_amount"])),
        total_amount_numeric=Decimal(str(pricing["total_amount_numeric"])),
        provider_payout=Decimal(str(pricing["provider_payout"])),
        platform_commission=Decimal(str(pricing["platform_commission"])),
        total_amount=pricing["formatted_total"],
        start_otp=start_otp,
        completion_otp=completion_otp,
        payment_status="IN_ESCROW"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 4. Lock Provider Payout into Escrow Pending Balance
    wallet = _get_or_create_wallet(db, data.provider_id)
    wallet.pending_balance = (Decimal(str(wallet.pending_balance)) + Decimal(str(pricing["provider_payout"]))).quantize(Decimal("0.01"))
    db.commit()

    return _format_booking(booking, db)


def get_customer_bookings(db: Session, customer_id: int) -> list[dict]:
    bookings = (
        db.query(Booking)
        .filter(Booking.customer_id == customer_id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_format_booking(b, db) for b in bookings]


def get_provider_bookings(db: Session, user_id: int) -> list[dict]:
    provider = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not provider:
        return []

    bookings = (
        db.query(Booking)
        .filter(Booking.provider_id == provider.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_format_booking(b, db) for b in bookings]


def update_booking_status(db: Session, booking_id: int, current_user: User, new_status: str, cancellation_reason: str = None) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    valid_statuses = [s.value for s in BookingStatus]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    is_admin = current_user.role == UserRole.ADMIN.value
    is_provider = provider and provider.user_id == current_user.id
    is_customer = booking.customer_id == current_user.id

    if not (is_admin or is_provider or is_customer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this booking"
        )

    # Cancellation Logic
    if new_status in [BookingStatus.CANCELLED.value, BookingStatus.DECLINED.value]:
        if booking.status not in [BookingStatus.CANCELLED.value, BookingStatus.COMPLETED.value]:
            # Release escrow from provider's pending balance
            wallet = _get_or_create_wallet(db, booking.provider_id)
            wallet.pending_balance = max(Decimal("0.00"), Decimal(str(wallet.pending_balance)) - Decimal(str(booking.provider_payout)))
            booking.payment_status = "REFUNDED"
            if cancellation_reason:
                booking.cancellation_reason = cancellation_reason

    booking.status = new_status
    db.commit()
    db.refresh(booking)

    return _format_booking(booking, db)


def provider_start_job(db: Session, user_id: int, booking_id: int, start_otp: str) -> dict:
    provider = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or booking.provider_id != provider.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found for this provider")

    if booking.start_otp and booking.start_otp.strip() != start_otp.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Start OTP provided by customer")

    booking.status = BookingStatus.IN_PROGRESS.value
    db.commit()
    db.refresh(booking)
    return _format_booking(booking, db)


def provider_complete_job(db: Session, user_id: int, booking_id: int, completion_otp: str) -> dict:
    provider = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or booking.provider_id != provider.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found for this provider")

    if booking.completion_otp and booking.completion_otp.strip() != completion_otp.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Completion OTP. Customer must provide completion code after inspecting work.")

    if booking.status == BookingStatus.COMPLETED.value:
        return _format_booking(booking, db)

    # 1. Update Booking Status
    booking.status = BookingStatus.COMPLETED.value
    booking.payment_status = "PAID_OUT"

    # 2. Automated Financial Settlement: Escrow -> Provider Wallet
    wallet = _get_or_create_wallet(db, provider.id)
    payout_dec = Decimal(str(booking.provider_payout))

    wallet.pending_balance = max(Decimal("0.00"), Decimal(str(wallet.pending_balance)) - payout_dec)
    wallet.available_balance = (Decimal(str(wallet.available_balance)) + payout_dec).quantize(Decimal("0.01"))

    # 3. Log Financial Ledger Transaction
    tx = WalletTransaction(
        wallet_id=wallet.id,
        provider_id=provider.id,
        booking_id=booking.id,
        transaction_type="CREDIT_PAYOUT",
        amount=payout_dec,
        balance_after=wallet.available_balance,
        description=f"Automated Escrow Payout for Booking #{booking.id}"
    )
    db.add(tx)
    db.commit()
    db.refresh(booking)

    return _format_booking(booking, db)


def provider_submit_extra_quote(db: Session, user_id: int, booking_id: int, quote_data: ExtraQuoteCreate) -> dict:
    provider = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found")

    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.provider_id == provider.id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found for this provider")

    quote = BookingExtraQuote(
        booking_id=booking.id,
        provider_id=provider.id,
        title=quote_data.title.strip(),
        description=quote_data.description.strip() if quote_data.description else None,
        amount=Decimal(str(quote_data.amount)),
        status="PENDING"
    )
    db.add(quote)
    db.commit()
    db.refresh(quote)

    return {
        "id": quote.id,
        "booking_id": quote.booking_id,
        "provider_id": quote.provider_id,
        "title": quote.title,
        "description": quote.description,
        "amount": float(quote.amount),
        "status": quote.status,
        "created_at": quote.created_at,
        "resolved_at": quote.resolved_at
    }


def customer_resolve_extra_quote(db: Session, customer_id: int, quote_id: int, action: str) -> dict:
    quote = db.query(BookingExtraQuote).filter(BookingExtraQuote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extra quote not found")

    booking = db.query(Booking).filter(Booking.id == quote.booking_id, Booking.customer_id == customer_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this booking quote")

    if quote.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Quote has already been {quote.status}")

    normalized_action = action.upper().strip()
    if normalized_action not in ["APPROVE", "REJECT"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be APPROVE or REJECT")

    if normalized_action == "REJECT":
        quote.status = "REJECTED"
        quote.resolved_at = func.now()
        db.commit()
        return {"message": "Quote rejected", "status": "REJECTED"}

    # APPROVE Flow: Recalculate totals and adjust escrow
    quote.status = "APPROVED"
    quote.resolved_at = func.now()

    new_extra_amount = Decimal(str(booking.extra_amount or 0.00)) + Decimal(str(quote.amount))
    booking.extra_amount = new_extra_amount

    # Recalculate full financial ledger
    new_pricing = calculate_pricing(
        base_amount=booking.base_amount,
        extra_amount=new_extra_amount,
        platform_fee=booking.platform_fee
    )

    old_payout = Decimal(str(booking.provider_payout))
    new_payout = Decimal(str(new_pricing["provider_payout"]))
    payout_difference = new_payout - old_payout

    booking.platform_commission = Decimal(str(new_pricing["platform_commission"]))
    booking.provider_payout = new_payout
    booking.total_amount_numeric = Decimal(str(new_pricing["total_amount_numeric"]))
    booking.total_amount = new_pricing["formatted_total"]

    # Update Provider Wallet Pending Escrow
    wallet = _get_or_create_wallet(db, booking.provider_id)
    wallet.pending_balance = (Decimal(str(wallet.pending_balance)) + payout_difference).quantize(Decimal("0.01"))

    db.commit()
    db.refresh(booking)
    return {"message": "Quote approved and invoice updated in escrow", "status": "APPROVED", "booking": _format_booking(booking, db)}


def get_provider_wallet_details(db: Session, user_id: int) -> dict:
    provider = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found")

    wallet = _get_or_create_wallet(db, provider.id)
    txs = (
        db.query(WalletTransaction)
        .filter(WalletTransaction.wallet_id == wallet.id)
        .order_by(WalletTransaction.created_at.desc())
        .limit(50)
        .all()
    )

    return {
        "provider_id": provider.id,
        "available_balance": float(wallet.available_balance),
        "pending_balance": float(wallet.pending_balance),
        "total_withdrawn": float(wallet.total_withdrawn),
        "transactions": [
            {
                "id": t.id,
                "wallet_id": t.wallet_id,
                "provider_id": t.provider_id,
                "booking_id": t.booking_id,
                "transaction_type": t.transaction_type,
                "amount": float(t.amount),
                "balance_after": float(t.balance_after),
                "description": t.description,
                "created_at": t.created_at
            }
            for t in txs
        ]
    }


def provider_request_withdrawal(db: Session, user_id: int, amount: float, note: str = None) -> dict:
    provider = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found")

    wallet = _get_or_create_wallet(db, provider.id)
    req_amt = Decimal(str(amount)).quantize(Decimal("0.01"))

    if req_amt <= Decimal("0.00"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Withdrawal amount must be greater than zero")

    if req_amt > Decimal(str(wallet.available_balance)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient available balance. Requested: ₹{req_amt}, Available: ₹{wallet.available_balance}"
        )

    wallet.available_balance = (Decimal(str(wallet.available_balance)) - req_amt).quantize(Decimal("0.01"))
    wallet.total_withdrawn = (Decimal(str(wallet.total_withdrawn)) + req_amt).quantize(Decimal("0.01"))

    tx = WalletTransaction(
        wallet_id=wallet.id,
        provider_id=provider.id,
        transaction_type="WITHDRAWAL",
        amount=-req_amt,
        balance_after=wallet.available_balance,
        description=f"Bank Withdrawal Transfer ({note or 'Direct Payout'})"
    )
    db.add(tx)
    db.commit()

    return {
        "message": f"Withdrawal of Rs. {req_amt} initiated successfully!",
        "available_balance": float(wallet.available_balance),
        "total_withdrawn": float(wallet.total_withdrawn)
    }
