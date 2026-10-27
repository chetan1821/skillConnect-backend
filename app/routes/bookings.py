from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingStatusUpdate,
    BookingResponse,
)
from app.models.enums import BookingStatus
from app.services.booking_service import (
    create_booking,
    get_customer_bookings,
    get_provider_bookings,
    update_booking_status,
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
    Customer places a booking request for a verified provider.
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
    Retrieve all bookings placed by the current customer.
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
    Provider accepts, declines, starts, or completes a booking.
    """
    return update_booking_status(
        db=db,
        booking_id=booking_id,
        current_user=current_user,
        new_status=status_data.status
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

