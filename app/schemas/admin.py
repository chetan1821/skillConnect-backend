from pydantic import BaseModel,Field,EmailStr



class AdminCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=8, max_length=100)

class AdminDashboardResponse(BaseModel):
    total_users: int
    total_customers: int
    total_providers: int
    active_users: int
    inactive_users: int

class AdminUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str
    role: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }


class AdminUserListResponse(BaseModel):
    total: int
    page: int
    limit: int
    users: list[AdminUserResponse]

class UserStatusUpdate(BaseModel):
    is_active: bool