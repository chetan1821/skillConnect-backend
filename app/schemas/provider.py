from pydantic import BaseModel, ConfigDict, Field, EmailStr


class ProviderRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=6, max_length=100)

    business_name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    experience_years: int = Field(default=0, ge=0)
    visiting_fee: float = Field(default=199.00, ge=0)
    hourly_rate: float = Field(default=300.00, ge=0)
    category_id: int | None = None
    is_verified: bool = False


class ProviderCreate(BaseModel):
    user_id: int
    business_name: str = Field(min_length=2, max_length=150)
    description: str | None = None
    experience_years: int = Field(default=0, ge=0)
    visiting_fee: float = Field(default=199.00, ge=0)
    hourly_rate: float = Field(default=300.00, ge=0)


class ProviderUpdate(BaseModel):
    business_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )
    description: str | None = None
    experience_years: int | None = Field(
        default=None,
        ge=0
    )
    visiting_fee: float | None = Field(default=None, ge=0)
    hourly_rate: float | None = Field(default=None, ge=0)
    is_verified: bool | None = None
    is_active: bool | None = None


class ProviderResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    description: str | None = None
    experience_years: int
    visiting_fee: float | None = 199.00
    hourly_rate: float | None = 300.00
    is_verified: bool
    is_active: bool
    full_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    categories: list[str] = []

    model_config = ConfigDict(from_attributes=True)
