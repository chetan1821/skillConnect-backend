from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.password import hash_password
from app.models.enums import UserRole


def create_user(db: Session, user_data: UserCreate) -> User:
    email_clean = user_data.email.strip().lower()
    existing_user = db.query(User).filter(func.lower(User.email) == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in."
        )

    user = User(
        full_name=user_data.full_name.strip(),
        email=email_clean,
        phone_number=user_data.phone_number.strip(),
        password=hash_password(user_data.password),
        role=UserRole.CUSTOMER.value,
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
