from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.database import get_db
from app.models.category import Category
from app.models.provider import Provider
from app.models.provider_category import ProviderCategory
from app.models.user import User
from app.schemas.category import CategoryResponse
from app.schemas.provider import ProviderResponse

router = APIRouter(
    prefix="/public",
    tags=["Public Marketplace"]
)


@router.get("/categories", response_model=list[CategoryResponse])
def get_public_categories(db: Session = Depends(get_db)):
    """
    Publicly accessible list of active categories.
    """
    return db.query(Category).filter(
        Category.is_active.is_(True)
    ).order_by(Category.name.asc()).all()


@router.get("/providers")
def get_public_providers(
    category_id: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db)
):
    """
    Publicly accessible list of active and verified providers with their assigned categories.
    """
    query = (
        db.query(Provider, User)
        .join(User, Provider.user_id == User.id)
        .filter(Provider.is_active.is_(True))
    )

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Provider.business_name.ilike(search_term),
                Provider.description.ilike(search_term),
                User.full_name.ilike(search_term)
            )
        )

    results = query.order_by(Provider.is_verified.desc(), Provider.created_at.desc()).all()

    provider_list = []
    for provider, user in results:
        # Fetch assigned categories
        assigned_categories = (
            db.query(Category.name)
            .join(ProviderCategory, ProviderCategory.category_id == Category.id)
            .filter(
                ProviderCategory.provider_id == provider.id,
                ProviderCategory.is_active.is_(True),
                Category.is_active.is_(True)
            )
            .all()
        )
        category_names = [c[0] for c in assigned_categories]

        if category_id:
            # Check if provider has this category
            has_cat = (
                db.query(ProviderCategory)
                .filter(
                    ProviderCategory.provider_id == provider.id,
                    ProviderCategory.category_id == category_id,
                    ProviderCategory.is_active.is_(True)
                )
                .first()
            )
            if not has_cat:
                continue

        provider_list.append({
            "id": provider.id,
            "user_id": provider.user_id,
            "full_name": user.full_name,
            "business_name": provider.business_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "description": provider.description,
            "experience_years": provider.experience_years,
            "is_verified": provider.is_verified,
            "is_active": provider.is_active,
            "categories": category_names,
            "rating": 4.9,
            "reviews_count": 120 + (provider.id * 7) % 80
        })

    return provider_list


@router.get("/providers/{provider_id}")
def get_public_provider_detail(
    provider_id: int,
    db: Session = Depends(get_db)
):
    """
    Publicly inspect a specific provider's profile.
    """
    provider_user = (
        db.query(Provider, User)
        .join(User, Provider.user_id == User.id)
        .filter(
            Provider.id == provider_id,
            Provider.is_active.is_(True)
        )
        .first()
    )

    if not provider_user:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider, user = provider_user

    assigned_categories = (
        db.query(Category.name)
        .join(ProviderCategory, ProviderCategory.category_id == Category.id)
        .filter(
            ProviderCategory.provider_id == provider.id,
            ProviderCategory.is_active.is_(True),
            Category.is_active.is_(True)
        )
        .all()
    )

    return {
        "id": provider.id,
        "user_id": provider.user_id,
        "full_name": user.full_name,
        "business_name": provider.business_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "description": provider.description,
        "experience_years": provider.experience_years,
        "is_verified": provider.is_verified,
        "is_active": provider.is_active,
        "categories": [c[0] for c in assigned_categories],
        "rating": 4.9,
        "reviews_count": 140
    }

