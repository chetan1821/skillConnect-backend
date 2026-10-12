from pydantic import BaseModel, ConfigDict


class ProviderCategoryCreate(BaseModel):
    category_id: int


class ProviderCategoryResponse(BaseModel):
    id: int
    provider_id: int
    category_id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)