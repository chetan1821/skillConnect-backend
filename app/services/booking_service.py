from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.booking import Booking
from app.models.provider import Provider
from app.models.user import User
from app.models.category import Category
from app.models.enums import BookingStatus, UserRole
from app.schemas.booking import BookingCreate


def _format_booking(booking: Booking, db: Session) -> dict:
    customer = db.query(User).filter(User.id == booking.customer_id).first()
    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()
    provider_user = db.query(User).filter(User.id == provider.user_id).first() if provider else None
    category = db.query(Category).filter(Category.id == booking.category_id).first() if booking.category_id else None

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
        "created_at": booking.created_at,
        "customer_name": customer.full_name if customer else "Customer",
        "customer_email": customer.email if customer else "",
        "customer_phone": customer.phone_number if customer else "",
        "provider_business_name": provider.business_name if provider else "Provider",
        "provider_name": provider_user.full_name if provider_user else "",
        "provider_phone": provider_user.phone_number if provider_user else "",
        "category_name": category.name if category else "General Service"
    }


def create_booking(db: Session, customer_id: int, data: BookingCreate) -> dict:
    # 1. Verify customer
    customer = db.query(User).filter(User.id == customer_id, User.is_active.is_(True)).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer account not found or inactive"
        )

    # 2. Verify provider
    provider = db.query(Provider).filter(Provider.id == data.provider_id, Provider.is_active.is_(True)).first()
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found or inactive"
        )

    # Prevent customer from booking their own provider profile
    if provider.user_id == customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book an appointment with your own provider account"
        )

    # 3. Verify category if provided
    if data.category_id:
        category = db.query(Category).filter(Category.id == data.category_id, Category.is_active.is_(True)).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected category not found or inactive"
            )

    booking = Booking(
        customer_id=customer_id,
        provider_id=data.provider_id,
        category_id=data.category_id,
        scheduled_date=data.scheduled_date,
        time_slot=data.time_slot,
        service_address=data.service_address,
        service_note=data.service_note,
        total_amount=data.total_amount or "$50.00",
        status=BookingStatus.PENDING.value
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

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
    # Locate provider linked to current user
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


def update_booking_status(db: Session, booking_id: int, current_user: User, new_status: str) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Validate target status
    valid_statuses = [s.value for s in BookingStatus]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    provider = db.query(Provider).filter(Provider.id == booking.provider_id).first()

    # Permissions logic
    is_admin = current_user.role == UserRole.ADMIN.value
    is_provider = provider and provider.user_id == current_user.id
    is_customer = booking.customer_id == current_user.id

    if not (is_admin or is_provider or is_customer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this booking"
        )

    # Specific role constraints:
    if is_customer and not is_admin:
        if new_status != BookingStatus.CANCELLED.value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customers can only cancel a booking"
            )
        if booking.status in [BookingStatus.COMPLETED.value, BookingStatus.CANCELLED.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel a booking that is already {booking.status}"
            )

    booking.status = new_status
    db.commit()
    db.refresh(booking)

    return _format_booking(booking, db)

