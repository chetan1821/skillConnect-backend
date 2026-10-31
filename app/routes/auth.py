from fastapi import APIRouter, Depends , HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import create_user
from app.auth.dependencies import get_current_user
from app.schemas.user import UserResponse

from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.auth.password import verify_password
from app.auth.jwt import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user(db, user_data)

@router.post("/login", response_model=TokenResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    email_clean = login_data.email.strip().lower()
    user = db.query(User).filter(
        func.lower(User.email) == email_clean
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    if not verify_password(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email
    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user