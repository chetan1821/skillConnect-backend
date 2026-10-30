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

class AdminUserProfileResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str
    role: str
    is_active: bool
    created_at: str | None = None
    provider_id: int | None = None
    business_name: str | None = None
    description: str | None = None
    experience_years: int | None = None
    is_verified: bool | None = None
    categories: list[str] = []
    total_bookings: int = 0
    completed_bookings: int = 0
    pending_bookings: int = 0
    recent_bookings: list[dict] = []

    model_config = {
        "from_attributes": True
    }


class AdminAnalyticsResponse(BaseModel):
    total_bookings: int
    completed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    in_progress_bookings: int
    total_gmv: str
    completed_revenue: str
    platform_commission: str
    active_providers_count: int
    active_customers_count: int


class AuditLogResponse(BaseModel):
    id: int
    admin_email: str
    action: str
    target_type: str
    target_id: str | None = None
    details: str | None = None
    created_at: str | None = None

    model_config = {
        "from_attributes": True
    }


class AnnouncementRequest(BaseModel):
    message: str = Field(min_length=3, max_length=500)
    banner_type: str = Field(default="info")
    is_active: bool = True


class AnnouncementResponse(BaseModel):
    id: int | None = None
    message: str | None = None
    banner_type: str = "info"
    is_active: bool = False
    updated_at: str | None = None

    model_config = {
        "from_attributes": True
    }
