from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
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
    Retrieve all bookings placed by the current customer, including security OTPs.
    """
    return get_customer_bookings(
        db=db,
        customer_id=current_user.id
    )


@router.get(
    "/provider",
    response_model=list[BookingResponse]
)
def list_provider_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all booking requests assigned to the logged-in provider.
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
    status_data: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provider accepts or declines a booking request.
    """
    return update_booking_status(
        db=db,
        booking_id=booking_id,
        current_user=current_user,
        new_status=status_data.status,
        cancellation_reason=status_data.cancellation_reason
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
    Provider starts the job after verifying the Customer's Start OTP.
    """
    return provider_start_job(
        db=db,
        user_id=current_user.id,
        booking_id=booking_id,
        start_otp=data.start_otp
    )


@router.post(
    "/{booking_id}/complete",
    response_model=BookingResponse
)
def complete_booking_job(
    booking_id: int,
    data: CompleteJobRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provider completes work and verifies Customer Completion OTP to release Escrow payout.
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
def submit_extra_quote(
    booking_id: int,
    data: ExtraQuoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provider submits an additional parts or labor quote for customer approval.
    """
    return provider_submit_extra_quote(
        db=db,
        user_id=current_user.id,
        booking_id=booking_id,
        quote_data=data
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
    Customer approves or rejects a provider's extra parts/materials quote.
    """
    return customer_resolve_extra_quote(
        db=db,
        customer_id=current_user.id,
        quote_id=quote_id,
        action=data.action
    )


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
