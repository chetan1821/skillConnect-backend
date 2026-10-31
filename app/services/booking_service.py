import random
from datetime import datetime
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
from app.models.review import Review
from app.models.chat_message import ChatMessage
from app.models.notification import Notification
from app.models.enums import BookingStatus, UserRole
from app.schemas.booking import (
    BookingCreate,
    ExtraQuoteCreate,
    ReviewCreate,
    ChatMessageCreate,
    DisputeCreate,
    DisputeResolveRequest,
    PaymentCheckoutRequest
)
from app.services.pricing_service import calculate_pricing


# -------------------------------------------------------------
# Internal Helpers
# -------------------------------------------------------------
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


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    link_type: str = None,
    link_id: int = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        link_type=link_type,
        link_id=link_id,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def _format_booking(booking: Booking, db: Session) -> dict:
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    provider_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
    category = db.query(Category).filter(Category.id == booking.category_id).first() if booking.category_id else None

    # Extra quotes
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

    # Review
    review = db.query(Review).filter(Review.booking_id == booking.id).first()
    formatted_review = {
        "id": review.id,
        "booking_id": review.booking_id,
        "customer_id": review.customer_id,
        "provider_id": review.provider_id,
        "rating": review.rating,
        "title": review.title,
        "comment": review.comment,
        "tags": review.tags,
        "customer_name": customer.full_name if customer else "Customer",
        "created_at": review.created_at
    } if review else None

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

        # Security & OTPs
        "start_otp": booking.start_otp,
        "completion_otp": booking.completion_otp,
        "cancellation_reason": booking.cancellation_reason,

        # Dispute Fields
        "dispute_status": booking.dispute_status or "NONE",
        "dispute_reason": booking.dispute_reason,
        "dispute_resolution": booking.dispute_resolution,

        "extra_quotes": formatted_quotes,
        "review": formatted_review,
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


# -------------------------------------------------------------
# Booking Lifecycle
# -------------------------------------------------------------
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

    # 2. Generate Verification OTPs
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
        payment_status="IN_ESCROW",
        dispute_status="NONE"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 4. Lock Provider Payout into Escrow Pending Balance
    wallet = _get_or_create_wallet(db, data.provider_id)
    wallet.pending_balance = (Decimal(str(wallet.pending_balance)) + Decimal(str(pricing["provider_payout"]))).quantize(Decimal("0.01"))
    db.commit()

    # 5. Dispatch Notifications
    create_notification(
        db,
        user_id=customer_id,
        title="Booking Placed with Escrow Hold",
        message=f"Booking #{booking.id} placed with {provider.business_name}. Your Start OTP is {start_otp}.",
        link_type="BOOKING",
        link_id=booking.id
    )
    create_notification(
        db,
        user_id=provider.user_id,
        title="New Service Request Assigned",
        message=f"New appointment #{booking.id} from {customer.full_name} for {booking.scheduled_date}.",
        link_type="BOOKING",
        link_id=booking.id
    )

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
            wallet = _get_or_create_wallet(db, booking.provider_id)
            wallet.pending_balance = max(Decimal("0.00"), Decimal(str(wallet.pending_balance)) - Decimal(str(booking.provider_payout)))
            booking.payment_status = "REFUNDED"
            if cancellation_reason:
                booking.cancellation_reason = cancellation_reason

    booking.status = new_status
    db.commit()
    db.refresh(booking)

    # Dispatch notification to counterparty
    if is_provider:
        create_notification(
            db,
            user_id=booking.customer_id,
            title=f"Booking Status: {new_status}",
            message=f"{provider.business_name} updated Booking #{booking.id} to {new_status}.",
            link_type="BOOKING",
            link_id=booking.id
        )
    elif is_customer and provider:
        create_notification(
            db,
            user_id=provider.user_id,
            title=f"Booking Status: {new_status}",
            message=f"Customer updated Booking #{booking.id} to {new_status}.",
            link_type="BOOKING",
            link_id=booking.id
        )

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

    booking.status = BookingStatus.STARTED.value
    db.commit()
    db.refresh(booking)

    create_notification(
        db,
        user_id=booking.customer_id,
        title="Specialist Arrived (Start OTP Verified)",
        message=f"{provider.business_name} has arrived and verified your Start OTP. Job #{booking.id} is now Started.",
        link_type="BOOKING",
        link_id=booking.id
    )

    return _format_booking(booking, db)


def provider_complete_job(db: Session, user_id: int, booking_id: int, completion_otp: str) -> dict:
    provider = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or booking.provider_id != provider.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found for this provider")

    if booking.status == BookingStatus.COMPLETED.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This booking has already been completed")

    if booking.completion_otp and booking.completion_otp.strip() != completion_otp.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Completion OTP entered")

    # 1. Update Booking Status
    booking.status = BookingStatus.COMPLETED.value
    booking.payment_status = "PAID_OUT"

    # 2. Release Escrow from pending to available balance
    wallet = _get_or_create_wallet(db, provider.id)
    payout_amt = Decimal(str(booking.provider_payout))

    wallet.pending_balance = max(Decimal("0.00"), Decimal(str(wallet.pending_balance)) - payout_amt)
    wallet.available_balance = (Decimal(str(wallet.available_balance)) + payout_amt).quantize(Decimal("0.01"))

    # 3. Create Wallet Ledger Transaction
    tx = WalletTransaction(
        wallet_id=wallet.id,
        provider_id=provider.id,
        booking_id=booking.id,
        transaction_type="CREDIT_PAYOUT",
        amount=payout_amt,
        balance_after=wallet.available_balance,
        description=f"Escrow release for Booking #{booking.id} ({booking.service_note or 'Completed Job'})"
    )
    db.add(tx)
    db.commit()
    db.refresh(booking)

    # 4. Dispatch Notifications
    create_notification(
        db,
        user_id=booking.customer_id,
        title="Job Certified Complete — Leave a Review!",
        message=f"Job #{booking.id} with {provider.business_name} is complete. Tap to rate your specialist.",
        link_type="REVIEW",
        link_id=booking.id
    )
    create_notification(
        db,
        user_id=provider.user_id,
        title="Escrow Payout Released!",
        message=f"Rs. {payout_amt} credited to your available wallet balance for Booking #{booking.id}.",
        link_type="WALLET",
        link_id=booking.id
    )

    return {
        "message": f"Job #{booking.id} completed successfully! Rs. {payout_amt} released to provider wallet.",
        "booking": _format_booking(booking, db)
    }


# -------------------------------------------------------------
# Extra Quotes
# -------------------------------------------------------------
def provider_submit_extra_quote(db: Session, user_id: int, booking_id: int, data: ExtraQuoteCreate) -> dict:
    provider = db.query(Provider).filter(Provider.user_id == user_id).first()
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found")

    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.provider_id == provider.id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found for this provider")

    quote = BookingExtraQuote(
        booking_id=booking.id,
        provider_id=provider.id,
        title=data.title,
        description=data.description,
        amount=Decimal(str(data.amount)),
        status="PENDING"
    )
    db.add(quote)
    if booking.status == BookingStatus.STARTED.value:
        booking.status = BookingStatus.IN_PROGRESS.value
    db.commit()
    db.refresh(quote)

    create_notification(
        db,
        user_id=booking.customer_id,
        title="Extra Material / Parts Quote Requested",
        message=f"{provider.business_name} requested an extra quote of Rs. {data.amount} for '{data.title}'.",
        link_type="BOOKING",
        link_id=booking.id
    )

    return {
        "id": quote.id,
        "booking_id": quote.booking_id,
        "provider_id": quote.provider_id,
        "title": quote.title,
        "description": quote.description,
        "amount": float(quote.amount),
        "status": quote.status,
        "created_at": quote.created_at
    }


def customer_resolve_extra_quote(db: Session, customer_id: int, quote_id: int, action: str) -> dict:
    quote = db.query(BookingExtraQuote).filter(BookingExtraQuote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extra quote not found")

    booking = db.query(Booking).filter(Booking.id == quote.booking_id, Booking.customer_id == customer_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to resolve this quote")

    if quote.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Quote already resolved with status: {quote.status}")

    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()

    if action.upper() == "REJECT":
        quote.status = "REJECTED"
        quote.resolved_at = func.now()
        db.commit()

        if provider:
            create_notification(
                db,
                user_id=provider.user_id,
                title="Extra Quote Declined",
                message=f"Customer declined the extra quote of Rs. {quote.amount} for Booking #{booking.id}.",
                link_type="BOOKING",
                link_id=booking.id
            )

        return {"message": "Extra quote rejected", "status": "REJECTED", "booking": _format_booking(booking, db)}

    # If APPROVED
    quote.status = "APPROVED"
    quote.resolved_at = func.now()

    new_extra_total = Decimal(str(booking.extra_amount or 0.00)) + Decimal(str(quote.amount))
    new_pricing = calculate_pricing(
        base_amount=float(booking.base_amount),
        extra_amount=float(new_extra_total)
    )

    old_payout = Decimal(str(booking.provider_payout))
    new_payout = Decimal(str(new_pricing["provider_payout"]))
    payout_difference = new_payout - old_payout

    booking.extra_amount = Decimal(str(new_pricing["extra_amount"]))
    booking.total_amount_numeric = Decimal(str(new_pricing["total_amount_numeric"]))
    booking.provider_payout = Decimal(str(new_pricing["provider_payout"]))
    booking.platform_commission = Decimal(str(new_pricing["platform_commission"]))
    booking.total_amount = new_pricing["formatted_total"]

    if booking.status == BookingStatus.STARTED.value:
        booking.status = BookingStatus.IN_PROGRESS.value

    # Update Provider Wallet Pending Escrow
    wallet = _get_or_create_wallet(db, booking.provider_id)
    wallet.pending_balance = (Decimal(str(wallet.pending_balance)) + payout_difference).quantize(Decimal("0.01"))

    db.commit()
    db.refresh(booking)

    if provider:
        create_notification(
            db,
            user_id=provider.user_id,
            title="Extra Quote Approved!",
            message=f"Customer approved your Rs. {quote.amount} quote for Booking #{booking.id}.",
            link_type="BOOKING",
            link_id=booking.id
        )

    return {"message": "Quote approved and invoice updated in escrow", "status": "APPROVED", "booking": _format_booking(booking, db)}


# -------------------------------------------------------------
# Reviews & Ratings
# -------------------------------------------------------------
def create_booking_review(db: Session, customer_id: int, booking_id: int, data: ReviewCreate) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.customer_id == customer_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found for this customer")

    if booking.status != BookingStatus.COMPLETED.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only review completed appointments")

    existing_review = db.query(Review).filter(Review.booking_id == booking.id).first()
    if existing_review:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This booking has already been reviewed")

    review = Review(
        booking_id=booking.id,
        customer_id=customer_id,
        provider_id=booking.provider_id,
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        tags=data.tags
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate Provider Average Rating
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    if provider:
        all_reviews = db.query(Review).filter(Review.provider_id == provider.id).all()
        avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews) if all_reviews else 5.0
        # If provider model has rating/reviews_count attributes
        create_notification(
            db,
            user_id=provider.user_id,
            title=f"New {data.rating}-Star Review Received!",
            message=f"A customer left a {data.rating}★ review for Booking #{booking.id}: '{data.comment[:50]}...'",
            link_type="BOOKING",
            link_id=booking.id
        )

    customer = db.query(User).filter(User.id == customer_id).first()
    return {
        "id": review.id,
        "booking_id": review.booking_id,
        "customer_id": review.customer_id,
        "provider_id": review.provider_id,
        "rating": review.rating,
        "title": review.title,
        "comment": review.comment,
        "tags": review.tags,
        "customer_name": customer.full_name if customer else "Customer",
        "created_at": review.created_at
    }


def get_provider_reviews(db: Session, provider_id: int) -> list[dict]:
    reviews = (
        db.query(Review)
        .filter(Review.provider_id == provider_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    results = []
    for r in reviews:
        c = db.query(User).filter(User.id == r.customer_id).first()
        results.append({
            "id": r.id,
            "booking_id": r.booking_id,
            "customer_id": r.customer_id,
            "provider_id": r.provider_id,
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "tags": r.tags,
            "customer_name": c.full_name if c else "Customer",
            "created_at": r.created_at
        })
    return results


# -------------------------------------------------------------
# In-App Chat Messaging
# -------------------------------------------------------------
def send_chat_message(db: Session, booking_id: int, sender_id: int, data: ChatMessageCreate) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    sender = db.query(User).filter(User.id == sender_id).first()

    is_customer = booking.customer_id == sender_id
    is_provider = provider and provider.user_id == sender_id

    if not (is_customer or is_provider):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to participate in this chat")

    msg = ChatMessage(
        booking_id=booking.id,
        sender_id=sender_id,
        message=data.message,
        attachment_url=data.attachment_url,
        is_read=False
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Notify recipient
    recipient_id = provider.user_id if is_customer else booking.customer_id
    create_notification(
        db,
        user_id=recipient_id,
        title=f"New Message from {sender.full_name}",
        message=f"{data.message[:80]}",
        link_type="CHAT",
        link_id=booking.id
    )

    return {
        "id": msg.id,
        "booking_id": msg.booking_id,
        "sender_id": msg.sender_id,
        "sender_name": sender.full_name,
        "sender_role": sender.role,
        "message": msg.message,
        "attachment_url": msg.attachment_url,
        "is_read": msg.is_read,
        "created_at": msg.created_at
    }


def get_chat_messages(db: Session, booking_id: int, user_id: int) -> list[dict]:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    if booking.customer_id != user_id and (not provider or provider.user_id != user_id):
        user = db.query(User).filter(User.id == user_id).first()
        if not user or user.role != UserRole.ADMIN.value:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Mark unread messages sent to this user as read
    db.query(ChatMessage).filter(
        ChatMessage.booking_id == booking_id,
        ChatMessage.sender_id != user_id,
        ChatMessage.is_read.is_(False)
    ).update({"is_read": True})
    db.commit()

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.booking_id == booking_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    results = []
    for m in messages:
        u = db.query(User).filter(User.id == m.sender_id).first()
        results.append({
            "id": m.id,
            "booking_id": m.booking_id,
            "sender_id": m.sender_id,
            "sender_name": u.full_name if u else "User",
            "sender_role": u.role if u else "Customer",
            "message": m.message,
            "attachment_url": m.attachment_url,
            "is_read": m.is_read,
            "created_at": m.created_at
        })
    return results


# -------------------------------------------------------------
# Notifications API
# -------------------------------------------------------------
def get_user_notifications(db: Session, user_id: int, limit: int = 30) -> list[dict]:
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": n.id,
            "user_id": n.user_id,
            "title": n.title,
            "message": n.message,
            "link_type": n.link_type,
            "link_id": n.link_id,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        for n in notifs
    ]


def mark_notification_read(db: Session, notification_id: int, user_id: int) -> dict:
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read"}


def mark_all_notifications_read(db: Session, user_id: int) -> dict:
    db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read.is_(False)).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


# -------------------------------------------------------------
# Dispute Management & Arbitration
# -------------------------------------------------------------
def raise_booking_dispute(db: Session, customer_id: int, booking_id: int, data: DisputeCreate) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.customer_id == customer_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found for this customer")

    if booking.status in [BookingStatus.CANCELLED.value, BookingStatus.DECLINED.value]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot dispute a cancelled booking")

    booking.dispute_status = "OPEN"
    booking.dispute_reason = data.reason
    booking.dispute_notes = data.notes
    db.commit()
    db.refresh(booking)

    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    if provider:
        create_notification(
            db,
            user_id=provider.user_id,
            title="Dispute Raised on Booking",
            message=f"Customer raised an issue on Booking #{booking.id}: '{data.reason}'. Funds are held for arbitration.",
            link_type="DISPUTE",
            link_id=booking.id
        )

    return {"message": "Dispute submitted to admin arbitration center", "booking": _format_booking(booking, db)}


def resolve_booking_dispute(db: Session, booking_id: int, admin_user: User, data: DisputeResolveRequest) -> dict:
    if admin_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can resolve disputes")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    action = data.action.upper()
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    wallet = _get_or_create_wallet(db, booking.provider_id)
    payout_amt = Decimal(str(booking.provider_payout))

    if action == "REFUND":
        # Full refund to customer, cancel provider pending balance
        wallet.pending_balance = max(Decimal("0.00"), Decimal(str(wallet.pending_balance)) - payout_amt)
        booking.payment_status = "REFUNDED"
        booking.status = BookingStatus.CANCELLED.value
        booking.dispute_status = "RESOLVED_REFUND"
        booking.dispute_resolution = "Full Refund to Customer"
    elif action == "PAYOUT":
        # Release funds to provider
        wallet.pending_balance = max(Decimal("0.00"), Decimal(str(wallet.pending_balance)) - payout_amt)
        wallet.available_balance = (Decimal(str(wallet.available_balance)) + payout_amt).quantize(Decimal("0.01"))
        booking.payment_status = "PAID_OUT"
        booking.status = BookingStatus.COMPLETED.value
        booking.dispute_status = "RESOLVED_PAYOUT"
        booking.dispute_resolution = "Full Payout Released to Provider"
    elif action == "SPLIT":
        # 50% split settlement
        split_payout = (payout_amt / Decimal("2.00")).quantize(Decimal("0.01"))
        wallet.pending_balance = max(Decimal("0.00"), Decimal(str(wallet.pending_balance)) - payout_amt)
        wallet.available_balance = (Decimal(str(wallet.available_balance)) + split_payout).quantize(Decimal("0.01"))
        booking.payment_status = "PARTIAL_SETTLEMENT"
        booking.status = BookingStatus.COMPLETED.value
        booking.dispute_status = "RESOLVED_SPLIT"
        booking.dispute_resolution = "50/50 Split Arbitration Settlement"
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Action must be REFUND, PAYOUT, or SPLIT")

    booking.dispute_notes = data.resolution_notes
    booking.dispute_resolved_at = func.now()
    db.commit()
    db.refresh(booking)

    # Notify both customer and provider
    create_notification(
        db,
        user_id=booking.customer_id,
        title="Dispute Resolved by Admin",
        message=f"Dispute on Booking #{booking.id} was resolved: {booking.dispute_resolution}.",
        link_type="BOOKING",
        link_id=booking.id
    )
    if provider:
        create_notification(
            db,
            user_id=provider.user_id,
            title="Dispute Resolved by Admin",
            message=f"Dispute on Booking #{booking.id} was resolved: {booking.dispute_resolution}.",
            link_type="BOOKING",
            link_id=booking.id
        )

    return {"message": f"Dispute resolved successfully with action: {action}", "booking": _format_booking(booking, db)}


def list_all_disputes(db: Session) -> list[dict]:
    disputed_bookings = (
        db.query(Booking)
        .filter(Booking.dispute_status != "NONE")
        .order_by(Booking.created_at.desc())
        .all()
    )
    return [_format_booking(b, db) for b in disputed_bookings]


# -------------------------------------------------------------
# Payment Checkout
# -------------------------------------------------------------
def process_payment_checkout(db: Session, booking_id: int, customer_id: int, data: PaymentCheckoutRequest) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.customer_id == customer_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    txn_id = f"TXN_{random.randint(10000000, 99999999)}"
    booking.payment_status = "PAID_IN_ESCROW"
    db.commit()

    create_notification(
        db,
        user_id=customer_id,
        title="Payment Successful (Escrow Secured)",
        message=f"Payment of Rs. {booking.total_amount_numeric} confirmed via {data.payment_method}. Txn: {txn_id}.",
        link_type="BOOKING",
        link_id=booking.id
    )

    return {
        "booking_id": booking.id,
        "transaction_id": txn_id,
        "status": "SUCCESS",
        "amount_paid": float(booking.total_amount_numeric),
        "payment_method": data.payment_method,
        "receipt_url": f"/bookings/{booking.id}/invoice",
        "message": f"Payment of Rs. {booking.total_amount_numeric} verified and held in platform escrow!"
    }


# -------------------------------------------------------------
# Printable Invoice HTML
# -------------------------------------------------------------
def generate_booking_invoice_html(db: Session, booking_id: int, current_user: User) -> str:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    category = db.query(Category).filter(Category.id == booking.category_id).first() if booking.category_id else None

    # Load extra quotes
    quotes = db.query(BookingExtraQuote).filter(BookingExtraQuote.booking_id == booking.id, BookingExtraQuote.status == "APPROVED").all()

    extra_rows = ""
    for q in quotes:
        extra_rows += f"""
        <tr>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Approved Add-on: {q.title}</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. {float(q.amount):.2f}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>SkillConnect Invoice #{booking.id}</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 30px; }}
            .invoice-box {{ max-width: 800px; margin: auto; background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
            .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }}
            .brand {{ font-size: 26px; font-weight: 800; color: #4f46e5; }}
            .badge {{ display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; font-weight: bold; border-radius: 9999px; font-size: 12px; }}
            .grid {{ display: flex; justify-content: space-between; margin: 25px 0; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th {{ background: #f1f5f9; padding: 12px 14px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; }}
            .total-row td {{ font-weight: 800; font-size: 18px; color: #4f46e5; border-top: 2px solid #0f172a; padding: 15px 14px; }}
            .footer {{ text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }}
            @media print {{ body {{ background: #fff; padding: 0; }} .invoice-box {{ box-shadow: none; border: none; }} .no-print {{ display: none; }} }}
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="header">
                <div>
                    <div class="brand">⚡ SkillConnect</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Verified On-Demand Service Network</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 20px; font-weight: 700;">INVOICE #{booking.id}</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Date: {booking.created_at.strftime('%d %b %Y') if booking.created_at else 'N/A'}</div>
                    <div style="margin-top: 6px;"><span class="badge">ESCROW CLEARED / {booking.payment_status}</span></div>
                </div>
            </div>

            <div class="grid">
                <div>
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Billed To (Customer):</div>
                    <div style="font-size: 15px; font-weight: 700; margin-top: 4px;">{customer.full_name if customer else 'Customer'}</div>
                    <div style="font-size: 13px; color: #475569; margin-top: 2px;">{customer.email if customer else ''} • {customer.phone_number if customer else ''}</div>
                    <div style="font-size: 13px; color: #475569; margin-top: 2px;">{booking.service_address}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Specialist Provider:</div>
                    <div style="font-size: 15px; font-weight: 700; margin-top: 4px;">{provider.business_name if provider else 'Specialist'}</div>
                    <div style="font-size: 13px; color: #475569; margin-top: 2px;">Trade: {category.name if category else 'General Repair'}</div>
                    <div style="font-size: 13px; color: #475569; margin-top: 2px;">Scheduled: {booking.scheduled_date} ({booking.time_slot})</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Service Description</th>
                        <th style="text-align: right;">Amount (INR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Specialist Visiting & Diagnostic Fee</td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. {float(booking.base_amount or 0.00):.2f}</td>
                    </tr>
                    {extra_rows}
                    <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Platform Trust & Safety Fee</td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. {float(booking.platform_fee or 29.00):.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">Government GST / Tax (0%)</td>
                        <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: right;">Rs. {float(booking.tax_amount or 0.00):.2f}</td>
                    </tr>
                    <tr class="total-row">
                        <td>TOTAL PAID (INR)</td>
                        <td style="text-align: right;">Rs. {float(booking.total_amount_numeric or 0.00):.2f}</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
                <strong>Security Audit Trail:</strong>
                <div>• Start OTP Doorstep Verification: <strong>VERIFIED</strong></div>
                <div>• Completion OTP Sign-Off: <strong>CERTIFIED COMPLETE</strong></div>
                <div>• Payment Escrow Settlement: <strong>CLEARED</strong></div>
            </div>

            <div class="footer">
                Thank you for using SkillConnect! For support or inquiries, contact support@skillconnect.com.<br>
                <button class="no-print" onclick="window.print()" style="margin-top: 15px; padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">Print / Save PDF</button>
            </div>
        </div>
    </body>
    </html>
    """
    return html


# -------------------------------------------------------------
# Provider Wallet & Withdrawals
# -------------------------------------------------------------
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
            detail=f"Insufficient available balance. Requested: Rs. {req_amt}, Available: Rs. {wallet.available_balance}"
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

    create_notification(
        db,
        user_id=provider.user_id,
        title="Payout Withdrawal Initiated",
        message=f"Withdrawal of Rs. {req_amt} has been initiated to your registered bank account.",
        link_type="WALLET",
        link_id=wallet.id
    )

    return {
        "message": f"Withdrawal of Rs. {req_amt} initiated successfully!",
        "available_balance": float(wallet.available_balance),
        "total_withdrawn": float(wallet.total_withdrawn)
    }
