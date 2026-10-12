from sqlalchemy.orm import Session
from sqlalchemy import func , or_

from app.models.user import User
from app.models.enums import UserRole


from fastapi import HTTPException, status
from app.auth.password import hash_password
from app.schemas.admin import AdminCreate

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate

from app.models.provider import Provider
from app.schemas.provider import ProviderCreate, ProviderUpdate

from app.models.provider_category import ProviderCategory
from app.schemas.provider_category import ProviderCategoryCreate

def create_admin(db: Session, admin_data: AdminCreate):
    existing_email = db.query(User).filter(
        User.email == admin_data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_phone = db.query(User).filter(
        User.phone_number == admin_data.phone_number
    ).first()

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    admin = User(
        full_name=admin_data.full_name,
        email=admin_data.email,
        phone_number=admin_data.phone_number,
        password=hash_password(admin_data.password),
        role=UserRole.ADMIN.value,
        is_active=True
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin

def create_provider_with_user(
    db: Session,
    provider_data: ProviderCreate
):
    existing_email = db.query(User).filter(
        User.email == provider_data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_phone = db.query(User).filter(
        User.phone_number == provider_data.phone_number
    ).first()

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number already registered"
        )

    user = User(
        full_name=provider_data.full_name,
        email=provider_data.email,
        phone_number=provider_data.phone_number,
        password=hash_password(provider_data.password),
        role=UserRole.PROVIDER.value,
        is_active=True
    )

    db.add(user)
    db.flush()

    provider = Provider(
        user_id=user.id,
        business_name=provider_data.business_name,
        description=provider_data.description,
        experience_years=provider_data.experience_years,
        is_verified=False,
        is_active=True
    )

    db.add(provider)
    db.commit()
    db.refresh(provider)

    return provider


def get_dashboard_stats(db: Session) -> dict:

    total_users = db.query(
        func.count(User.id)
    ).scalar()

    total_customers = db.query(
        func.count(User.id)
    ).filter(
        User.role == UserRole.CUSTOMER.value
    ).scalar()

    total_providers = db.query(
        func.count(User.id)
    ).filter(
        User.role == UserRole.PROVIDER.value
    ).scalar()

    active_users = db.query(
        func.count(User.id)
    ).filter(
        User.is_active.is_(True)
    ).scalar()

    inactive_users = db.query(
        func.count(User.id)
    ).filter(
        User.is_active.is_(False)
    ).scalar()

    return {
        "total_users": total_users or 0,
        "total_customers": total_customers or 0,
        "total_providers": total_providers or 0,
        "active_users": active_users or 0,
        "inactive_users": inactive_users or 0,
    }

def get_users(
    db: Session,
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
):
    query = db.query(User)

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            or_(
                User.full_name.ilike(search_value),
                User.email.ilike(search_value),
                User.phone_number.ilike(search_value),
            )
        )

    if role:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()

    offset = (page - 1) * limit

    users = (
        query
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "users": users,
    }

def get_user_by_id(
    db: Session,
    user_id: int
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


def update_user_status(
    db: Session,
    user_id: int,
    is_active: bool,
    current_admin_id: int
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent admin from deactivating their own account
    if user.id == current_admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot deactivate their own account"
        )

    user.is_active = is_active

    db.commit()
    db.refresh(user)

    return user

def create_category(
    db: Session,
    category_data: CategoryCreate
):
    existing_category = db.query(Category).filter(
        Category.name.ilike(category_data.name.strip())
    ).first()

    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    category = Category(
        name=category_data.name.strip(),
        description=category_data.description
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category

def get_categories(
    db: Session,
    include_inactive: bool = False
):
    query = db.query(Category)

    if not include_inactive:
        query = query.filter(Category.is_active.is_(True))

    return query.order_by(Category.name.asc()).all()

def get_category_by_id(
    db: Session,
    category_id: int
):
    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category

def update_category(
    db: Session,
    category_id: int,
    category_data: CategoryUpdate
):
    category = get_category_by_id(
        db=db,
        category_id=category_id
    )

    update_data = category_data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        new_name = update_data["name"].strip()

        existing_category = db.query(Category).filter(
            Category.name.ilike(new_name),
            Category.id != category_id
        ).first()

        if existing_category:
            raise HTTPException(
                status_code=400,
                detail="Category already exists"
            )

        update_data["name"] = new_name

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)

    return category

def delete_category(
    db: Session,
    category_id: int
):
    category = get_category_by_id(
        db=db,
        category_id=category_id
    )

    category.is_active = False

    db.commit()
    db.refresh(category)

    return category



def create_provider(
    db: Session,
    provider_data: ProviderCreate
):
    user = db.query(User).filter(
        User.id == provider_data.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.role != UserRole.PROVIDER.value:
        raise HTTPException(
            status_code=400,
            detail="User must have Provider role"
        )

    existing_provider = db.query(Provider).filter(
        Provider.user_id == provider_data.user_id
    ).first()

    if existing_provider:
        raise HTTPException(
            status_code=400,
            detail="Provider profile already exists"
        )

    provider = Provider(
        user_id=provider_data.user_id,
        business_name=provider_data.business_name.strip(),
        description=provider_data.description,
        experience_years=provider_data.experience_years
    )

    db.add(provider)
    db.commit()
    db.refresh(provider)

    return provider


def get_providers(
    db: Session,
    include_inactive: bool = False
):
    query = db.query(Provider)

    if not include_inactive:
        query = query.filter(
            Provider.is_active.is_(True)
        )

    return query.order_by(
        Provider.created_at.desc()
    ).all()


def get_provider_by_id(
    db: Session,
    provider_id: int
):
    provider = db.query(Provider).filter(
        Provider.id == provider_id
    ).first()

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found"
        )

    return provider


def update_provider(
    db: Session,
    provider_id: int,
    provider_data: ProviderUpdate
):
    provider = get_provider_by_id(
        db=db,
        provider_id=provider_id
    )

    update_data = provider_data.model_dump(
        exclude_unset=True
    )

    if "business_name" in update_data:
        update_data["business_name"] = (
            update_data["business_name"].strip()
        )

    for field, value in update_data.items():
        setattr(provider, field, value)

    db.commit()
    db.refresh(provider)

    return provider


def delete_provider(
    db: Session,
    provider_id: int
):
    provider = get_provider_by_id(
        db=db,
        provider_id=provider_id
    )

    provider.is_active = False

    db.commit()
    db.refresh(provider)

    return provider



def assign_category_to_provider(
    db: Session,
    provider_id: int,
    category_id: int
):
    provider = db.query(Provider).filter(
        Provider.id == provider_id
    ).first()

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found"
        )

    category = db.query(Category).filter(
        Category.id == category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    if not provider.is_active:
        raise HTTPException(
            status_code=400,
            detail="Provider is inactive"
        )

    if not category.is_active:
        raise HTTPException(
            status_code=400,
            detail="Category is inactive"
        )

    existing_assignment = db.query(ProviderCategory).filter(
        ProviderCategory.provider_id == provider_id,
        ProviderCategory.category_id == category_id
    ).first()

    if existing_assignment:
        if not existing_assignment.is_active:
            existing_assignment.is_active = True
            db.commit()
            db.refresh(existing_assignment)
            return existing_assignment

        raise HTTPException(
            status_code=400,
            detail="Category already assigned to provider"
        )

    assignment = ProviderCategory(
        provider_id=provider_id,
        category_id=category_id
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    return assignment


def get_provider_categories(
    db: Session,
    provider_id: int
):
    provider = db.query(Provider).filter(
        Provider.id == provider_id
    ).first()

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Provider not found"
        )

    return db.query(ProviderCategory).filter(
        ProviderCategory.provider_id == provider_id,
        ProviderCategory.is_active.is_(True)
    ).all()


def remove_category_from_provider(
    db: Session,
    provider_id: int,
    category_id: int
):
    assignment = db.query(ProviderCategory).filter(
        ProviderCategory.provider_id == provider_id,
        ProviderCategory.category_id == category_id,
        ProviderCategory.is_active.is_(True)
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Category assignment not found"
        )

    assignment.is_active = False

    db.commit()
    db.refresh(assignment)

    return assignment