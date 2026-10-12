from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.password import hash_password
from app.models.enums import UserRole


def create_user(db: Session, user_data: UserCreate) -> User:
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        phone_number=user_data.phone_number,
        password=hash_password(user_data.password),
        role=UserRole.CUSTOMER.value,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user