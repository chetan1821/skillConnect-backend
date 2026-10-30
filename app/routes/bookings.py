from fastapi import APIRouter, Depends, status, Query, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, get_user_from_token, optional_security
from fastapi.security import HTTPAuthorizationCredentials
from app.database.database import get_db
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingStatusUpdate,
    BookingResponse,
    StartJobRequest,
    CompleteJobRequest,
    ExtraQuoteCreate,
    ExtraQuoteResponse,
    ExtraQuoteAction,
    ProviderWalletResponse,
    WithdrawRequest,
    ReviewCreate,
    ReviewResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    DisputeCreate,
    NotificationResponse,
    PaymentCheckoutRequest,
    PaymentCheckoutResponse
)
from app.models.enums import BookingStatus
from app.services.booking_service import (
    create_booking,
    get_customer_bookings,
    get_provider_bookings,
    update_booking_status,
    provider_start_job,
    provider_complete_job,
    provider_submit_extra_quote,
    customer_resolve_extra_quote,
    get_provider_wallet_details,
    provider_request_withdrawal,
    create_booking_review,
    send_chat_message,
    get_chat_messages,
    raise_booking_dispute,
    process_payment_checkout,
    generate_booking_invoice_html,
    get_user_notifications,
    mark_notification_read,
    mark_all_notifications_read
)

router = APIRouter(
    prefix="/bookings",
    tags=["Service Bookings"]
)


@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Customer places a booking request with transparent pricing and escrow hold.
    """
    return create_booking(
        db=db,
        customer_id=current_user.id,
        data=data
    )


@router.get(
    "/my",
    response_model=list[BookingResponse]
)
def list_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all service bookings placed by current customer.
    """
    return get_customer_bookings(
        db=db,
        customer_id=current_user.id
    )


# -------------------------------------------------------------
# Notifications
# -------------------------------------------------------------
@router.get(
    "/notifications",
    response_model=list[NotificationResponse]
)
def list_my_notifications(
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve recent in-app notifications for the authenticated user.
    """
    return get_user_notifications(db=db, user_id=current_user.id, limit=limit)


@router.patch(
    "/notifications/{notification_id}/read"
)
def mark_one_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return mark_notification_read(db=db, notification_id=notification_id, user_id=current_user.id)


@router.post(
    "/notifications/read-all"
)
def mark_all_my_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return mark_all_notifications_read(db=db, user_id=current_user.id)


@router.get(
    "/provider",
    response_model=list[BookingResponse]
)
def list_provider_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all bookings assigned to the authenticated provider.
    """
    return get_provider_bookings(
        db=db,
        user_id=current_user.id
    )


@router.patch(
    "/{booking_id}/status",
    response_model=BookingResponse
)
def change_booking_status(
    booking_id: int,
    data: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update booking lifecycle status (Accepted, Declined, Cancelled, etc.).
    """
    return update_booking_status(
        db=db,
        booking_id=booking_id,
        current_user=current_user,
        new_status=data.status,
        cancellation_reason=data.cancellation_reason
    )


@router.post(
    "/{booking_id}/start",
    response_model=BookingResponse
)
def start_booking_job(
    booking_id: int,
    data: StartJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provider verifies the 4-digit Start OTP provided by the customer at the doorstep.
    """
    return provider_start_job(
        db=db,
        user_id=current_user.id,
        booking_id=booking_id,
        start_otp=data.start_otp
    )


@router.post(
    "/{booking_id}/complete"
)
def complete_booking_job(
    booking_id: int,
    data: CompleteJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provider enters the Completion OTP provided by the customer upon satisfaction.
    Releases escrow payment directly to provider's available wallet balance.
    """
    return provider_complete_job(
        db=db,
        user_id=current_user.id,
        booking_id=booking_id,
        completion_otp=data.completion_otp
    )


@router.post(
    "/{booking_id}/extra-quotes",
    response_model=ExtraQuoteResponse,
    status_code=status.HTTP_201_CREATED
)
def request_extra_quote(
    booking_id: int,
    data: ExtraQuoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provider submits an additional materials or service fee quote for customer approval.
    """
    return provider_submit_extra_quote(
        db=db,
        user_id=current_user.id,
        booking_id=booking_id,
        data=data
    )


@router.post(
    "/extra-quotes/{quote_id}"
)
@router.patch(
    "/extra-quotes/{quote_id}"
)
def resolve_extra_quote(
    quote_id: int,
    data: ExtraQuoteAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Customer approves or rejects a pending extra quote requested by the provider.
    """
    return customer_resolve_extra_quote(
        db=db,
        customer_id=current_user.id,
        quote_id=quote_id,
        action=data.action
    )


# -------------------------------------------------------------
# Reviews & Ratings
# -------------------------------------------------------------
@router.post(
    "/{booking_id}/review",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def submit_review(
    booking_id: int,
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Customer submits rating and verified review for a completed service booking.
    """
    return create_booking_review(
        db=db,
        customer_id=current_user.id,
        booking_id=booking_id,
        data=data
    )


# -------------------------------------------------------------
# In-App Chat Messaging
# -------------------------------------------------------------
@router.post(
    "/{booking_id}/messages",
    response_model=ChatMessageResponse
)
def post_chat_message(
    booking_id: int,
    data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send an in-app message between customer and provider for a specific booking.
    """
    return send_chat_message(
        db=db,
        booking_id=booking_id,
        sender_id=current_user.id,
        data=data
    )


@router.get(
    "/{booking_id}/messages",
    response_model=list[ChatMessageResponse]
)
def list_chat_messages(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get conversation thread for a booking. Marks received messages as read.
    """
    return get_chat_messages(
        db=db,
        booking_id=booking_id,
        user_id=current_user.id
    )


# -------------------------------------------------------------
# Disputes
# -------------------------------------------------------------
@router.post(
    "/{booking_id}/dispute"
)
def dispute_booking(
    booking_id: int,
    data: DisputeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Customer raises a dispute or quality concern before sharing the Completion OTP.
    """
    return raise_booking_dispute(
        db=db,
        customer_id=current_user.id,
        booking_id=booking_id,
        data=data
    )


# -------------------------------------------------------------
# Payments & Invoices
# -------------------------------------------------------------
@router.post(
    "/{booking_id}/pay",
    response_model=PaymentCheckoutResponse
)
def pay_for_booking(
    booking_id: int,
    data: PaymentCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process payment checkout via UPI / Card / Netbanking with escrow lock.
    """
    return process_payment_checkout(
        db=db,
        booking_id=booking_id,
        customer_id=current_user.id,
        data=data
    )


@router.get(
    "/{booking_id}/invoice",
    response_class=HTMLResponse
)
def get_booking_invoice(
    booking_id: int,
    token: str | None = Query(None),
    auth: HTTPAuthorizationCredentials | None = Depends(optional_security),
    db: Session = Depends(get_db)
):
    """
    Generate clean, printable HTML tax invoice with security audit trail.
    Supports both Authorization header and ?token= query parameter.
    """
    current_user = None
    if auth and auth.credentials:
        try:
            current_user = get_user_from_token(auth.credentials, db)
        except Exception:
            pass
    if not current_user and token:
        try:
            current_user = get_user_from_token(token, db)
        except Exception:
            pass
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required to view invoice"
        )

    return generate_booking_invoice_html(
        db=db,
        booking_id=booking_id,
        current_user=current_user
    )


# -------------------------------------------------------------
# Provider Wallet
# -------------------------------------------------------------
@router.get(
    "/provider/wallet",
    response_model=ProviderWalletResponse
)
def get_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve provider's live wallet balances and payout transaction history.
    """
    return get_provider_wallet_details(
        db=db,
        user_id=current_user.id
    )


@router.post(
    "/provider/wallet/withdraw"
)
def request_wallet_withdrawal(
    data: WithdrawRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provider requests bank transfer withdrawal of cleared available balance.
    """
    return provider_request_withdrawal(
        db=db,
        user_id=current_user.id,
        amount=data.amount,
        note=data.bank_account_note
    )


@router.patch(
    "/{booking_id}/cancel",
    response_model=BookingResponse
)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Customer cancels their booking.
    """
    return update_booking_status(
        db=db,
        booking_id=booking_id,
        current_user=current_user,
        new_status=BookingStatus.CANCELLED.value
    )
