from pydantic import BaseModel, EmailStr
from app.models.enums import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: str
    role: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }