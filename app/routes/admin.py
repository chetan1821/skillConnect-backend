from fastapi import APIRouter, Depends,Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database.database import get_db
from app.models.user import User
from app.schemas.admin import AdminDashboardResponse
from app.services.admin_service import get_dashboard_stats

from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)
from app.schemas.provider import (
    ProviderCreate,
    ProviderUpdate,
    ProviderResponse,
)
from app.schemas.provider_category import (
    ProviderCategoryCreate,
    ProviderCategoryResponse,
)
from app.schemas.admin import (
    AdminDashboardResponse,
    AdminUserListResponse,
    AdminUserResponse,
    UserStatusUpdate
)

from app.services.admin_service import (
    get_dashboard_stats,
    get_users,
    get_user_by_id,
    update_user_status,
    create_category,
    get_categories,
    get_category_by_id,
    update_category,
    delete_category,
    create_provider,
    get_providers,
    get_provider_by_id,
    update_provider,
    delete_provider,
    assign_category_to_provider,
    get_provider_categories,
    remove_category_from_provider,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get(
    "/dashboard",
    response_model=AdminDashboardResponse
)
def dashboard(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return get_dashboard_stats(db)

@router.get(
    "/users",
    response_model=AdminUserListResponse
)
def list_users(
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_users(
        db=db,
        page=page,
        limit=limit,
        search=search,
        role=role,
        is_active=is_active,
    )

@router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse
)
def get_user(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_user_by_id(
        db=db,
        user_id=user_id
    )

@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserResponse
)
def update_status(
    user_id: int,
    status_data: UserStatusUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return update_user_status(
        db=db,
        user_id=user_id,
        is_active=status_data.is_active,
        current_admin_id=current_admin.id,
    )

@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=201
)
def create_category_endpoint(
    category_data: CategoryCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return create_category(
        db=db,
        category_data=category_data
    )


@router.get(
    "/categories",
    response_model=list[CategoryResponse]
)
def list_categories(
    include_inactive: bool = Query(False),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_categories(
        db=db,
        include_inactive=include_inactive
    )


@router.get(
    "/categories/{category_id}",
    response_model=CategoryResponse
)
def get_category(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_category_by_id(
        db=db,
        category_id=category_id
    )


@router.patch(
    "/categories/{category_id}",
    response_model=CategoryResponse
)
def update_category_endpoint(
    category_id: int,
    category_data: CategoryUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return update_category(
        db=db,
        category_id=category_id,
        category_data=category_data
    )


@router.delete(
    "/categories/{category_id}",
    response_model=CategoryResponse
)
def delete_category_endpoint(
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return delete_category(
        db=db,
        category_id=category_id
    )


@router.post(
    "/providers",
    response_model=ProviderResponse,
    status_code=201
)
def create_provider_endpoint(
    provider_data: ProviderCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return create_provider(
        db=db,
        provider_data=provider_data
    )


@router.get(
    "/providers",
    response_model=list[ProviderResponse]
)
def list_providers(
    include_inactive: bool = Query(False),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_providers(
        db=db,
        include_inactive=include_inactive
    )


@router.get(
    "/providers/{provider_id}",
    response_model=ProviderResponse
)
def get_provider(
    provider_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_provider_by_id(
        db=db,
        provider_id=provider_id
    )


@router.patch(
    "/providers/{provider_id}",
    response_model=ProviderResponse
)
def update_provider_endpoint(
    provider_id: int,
    provider_data: ProviderUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return update_provider(
        db=db,
        provider_id=provider_id,
        provider_data=provider_data
    )


@router.delete(
    "/providers/{provider_id}",
    response_model=ProviderResponse
)
def delete_provider_endpoint(
    provider_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return delete_provider(
        db=db,
        provider_id=provider_id
    )



@router.post(
    "/providers/{provider_id}/categories",
    response_model=ProviderCategoryResponse,
    status_code=201
)
def assign_provider_category(
    provider_id: int,
    assignment_data: ProviderCategoryCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return assign_category_to_provider(
        db=db,
        provider_id=provider_id,
        category_id=assignment_data.category_id
    )


@router.get(
    "/providers/{provider_id}/categories",
    response_model=list[ProviderCategoryResponse]
)
def list_provider_categories(
    provider_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_provider_categories(
        db=db,
        provider_id=provider_id
    )


@router.delete(
    "/providers/{provider_id}/categories/{category_id}",
    response_model=ProviderCategoryResponse
)
def remove_provider_category(
    provider_id: int,
    category_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return remove_category_from_provider(
        db=db,
        provider_id=provider_id,
        category_id=category_id
    )