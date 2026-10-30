from app.models.audit_log import AuditLog
from app.models.announcement import SystemAnnouncement
from app.services.booking_service import _format_booking
from app.models.booking import Booking
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
from app.schemas.provider import ProviderCreate, ProviderUpdate, ProviderRegister

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
    provider_data: ProviderRegister
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
        visiting_fee=getattr(provider_data, 'visiting_fee', 199.00) or 199.00,
        hourly_rate=getattr(provider_data, 'hourly_rate', 300.00) or 300.00,
        is_verified=getattr(provider_data, 'is_verified', False) or False,
        is_active=True
    )

    db.add(provider)
    db.commit()
    db.refresh(provider)

    cat_names = []
    if getattr(provider_data, 'category_id', None):
        try:
            assign_category_to_provider(db, provider.id, provider_data.category_id)
            cat = db.query(Category).filter(Category.id == provider_data.category_id).first()
            if cat:
                cat_names.append(cat.name)
        except Exception:
            pass

    return {
        "id": provider.id,
        "user_id": provider.user_id,
        "business_name": provider.business_name,
        "description": provider.description,
        "experience_years": provider.experience_years,
        "visiting_fee": float(provider.visiting_fee or 199.00),
        "hourly_rate": float(provider.hourly_rate or 300.00),
        "is_verified": provider.is_verified,
        "is_active": provider.is_active,
        "full_name": user.full_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "categories": cat_names
    }


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
    query = (
        db.query(Provider, User)
        .join(User, Provider.user_id == User.id)
    )

    if not include_inactive:
        query = query.filter(
            Provider.is_active.is_(True)
        )

    results = query.order_by(
        Provider.created_at.desc()
    ).all()

    providers = []
    for provider, user in results:
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
        cat_names = [c[0] for c in assigned_categories]

        providers.append({
            "id": provider.id,
            "user_id": provider.user_id,
            "business_name": provider.business_name,
            "description": provider.description,
            "experience_years": provider.experience_years,
        "visiting_fee": float(provider.visiting_fee or 199.00),
        "hourly_rate": float(provider.hourly_rate or 300.00),
            "is_verified": provider.is_verified,
            "is_active": provider.is_active,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "categories": cat_names
        })

    return providers


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

def get_user_profile_by_id(db: Session, user_id: int) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    created_at_str = user.created_at.strftime("%B %d, %Y") if user.created_at else None

    profile = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": created_at_str,
        "provider_id": None,
        "business_name": None,
        "description": None,
        "experience_years": None,
        "is_verified": None,
        "categories": [],
        "total_bookings": 0,
        "completed_bookings": 0,
        "pending_bookings": 0,
        "recent_bookings": []
    }

    if user.role == UserRole.PROVIDER.value:
        provider = db.query(Provider).filter(Provider.user_id == user.id).first()
        if provider:
            profile["provider_id"] = provider.id
            profile["business_name"] = provider.business_name
            profile["description"] = provider.description
            profile["experience_years"] = provider.experience_years
            profile["is_verified"] = provider.is_verified

            cats = (
                db.query(Category.name)
                .join(ProviderCategory, ProviderCategory.category_id == Category.id)
                .filter(
                    ProviderCategory.provider_id == provider.id,
                    ProviderCategory.is_active.is_(True),
                    Category.is_active.is_(True)
                )
                .all()
            )
            profile["categories"] = [c[0] for c in cats]

            provider_bookings = (
                db.query(Booking)
                .filter(Booking.provider_id == provider.id)
                .order_by(Booking.created_at.desc())
                .all()
            )
            profile["total_bookings"] = len(provider_bookings)
            profile["completed_bookings"] = len([b for b in provider_bookings if b.status == "Completed"])
            profile["pending_bookings"] = len([b for b in provider_bookings if b.status == "Pending"])
            profile["recent_bookings"] = [
                {
                    "id": b.id,
                    "scheduled_date": b.scheduled_date,
                    "time_slot": b.time_slot,
                    "status": b.status,
                    "service_address": b.service_address,
                    "service_note": b.service_note,
                    "total_amount": b.total_amount
                }
                for b in provider_bookings[:5]
            ]

    elif user.role == UserRole.CUSTOMER.value:
        cust_bookings = (
            db.query(Booking, Provider)
            .join(Provider, Booking.provider_id == Provider.id)
            .filter(Booking.customer_id == user.id)
            .order_by(Booking.created_at.desc())
            .all()
        )
        profile["total_bookings"] = len(cust_bookings)
        profile["completed_bookings"] = len([b for b, _ in cust_bookings if b.status == "Completed"])
        profile["pending_bookings"] = len([b for b, _ in cust_bookings if b.status == "Pending"])
        profile["recent_bookings"] = [
            {
                "id": b.id,
                "provider_business_name": p.business_name,
                "scheduled_date": b.scheduled_date,
                "time_slot": b.time_slot,
                "status": b.status,
                "service_address": b.service_address,
                "service_note": b.service_note,
                "total_amount": b.total_amount
            }
            for b, p in cust_bookings[:5]
        ]

    return profile


def record_audit_log(
    db: Session,
    admin_email: str,
    action: str,
    target_type: str,
    target_id: str | None = None,
    details: str | None = None,
    admin_id: int | None = None
):
    try:
        log = AuditLog(
            admin_id=admin_id,
            admin_email=admin_email,
            action=action,
            target_type=target_type,
            target_id=str(target_id) if target_id else None,
            details=details
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to record audit log: {e}")


def get_admin_audit_logs(db: Session, limit: int = 50):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "admin_email": l.admin_email,
            "action": l.action,
            "target_type": l.target_type,
            "target_id": l.target_id,
            "details": l.details,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else None
        }
        for l in logs
    ]


def get_all_admin_bookings(db: Session, status_filter: str | None = None, search: str | None = None):
    query = db.query(Booking)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Booking.status == status_filter)

    bookings = query.order_by(Booking.created_at.desc()).all()
    results = [_format_booking(b, db) for b in bookings]

    if search:
        s = search.lower().strip()
        results = [
            b for b in results
            if s in str(b["id"])
            or s in (b.get("customer_name") or "").lower()
            or s in (b.get("customer_email") or "").lower()
            or s in (b.get("provider_business_name") or "").lower()
            or s in (b.get("service_address") or "").lower()
            or s in (b.get("category_name") or "").lower()
        ]
    return results


def admin_update_booking_status(db: Session, booking_id: int, new_status: str, admin_email: str):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    old_status = booking.status
    booking.status = new_status
    db.commit()
    db.refresh(booking)

    record_audit_log(
        db=db,
        admin_email=admin_email,
        action="UPDATE_BOOKING_STATUS",
        target_type="BOOKING",
        target_id=str(booking_id),
        details=f"Status changed from '{old_status}' to '{new_status}' by admin"
    )

    return _format_booking(booking, db)


def get_admin_analytics(db: Session):
    bookings = db.query(Booking).all()
    total_count = len(bookings)
    completed_count = len([b for b in bookings if b.status == "Completed"])
    pending_count = len([b for b in bookings if b.status == "Pending"])
    cancelled_count = len([b for b in bookings if b.status == "Cancelled"])
    in_progress_count = len([b for b in bookings if b.status in ("Accepted", "In Progress")])

    def parse_amount(val):
        if not val:
            return 50.0
        cleaned = str(val).replace("$", "").replace("₹", "").replace(",", "").strip()
        try:
            return float(cleaned)
        except ValueError:
            return 50.0

    total_gmv_val = sum(parse_amount(b.total_amount) for b in bookings)
    completed_revenue_val = sum(parse_amount(b.total_amount) for b in bookings if b.status == "Completed")
    commission_val = completed_revenue_val * 0.10  # 10% platform take rate

    active_pros = db.query(Provider).filter(Provider.is_active.is_(True)).count()
    active_custs = db.query(User).filter(User.role == UserRole.CUSTOMER.value, User.is_active.is_(True)).count()

    return {
        "total_bookings": total_count,
        "completed_bookings": completed_count,
        "pending_bookings": pending_count,
        "cancelled_bookings": cancelled_count,
        "in_progress_bookings": in_progress_count,
        "total_gmv": f"${total_gmv_val:,.2f}",
        "completed_revenue": f"${completed_revenue_val:,.2f}",
        "platform_commission": f"${commission_val:,.2f}",
        "active_providers_count": active_pros,
        "active_customers_count": active_custs
    }


def get_system_announcement(db: Session):
    ann = db.query(SystemAnnouncement).order_by(SystemAnnouncement.id.desc()).first()
    if not ann:
        return {
            "id": None,
            "message": None,
            "banner_type": "info",
            "is_active": False,
            "updated_at": None
        }
    return {
        "id": ann.id,
        "message": ann.message,
        "banner_type": ann.banner_type,
        "is_active": ann.is_active,
        "updated_at": ann.updated_at.strftime("%Y-%m-%d %H:%M") if ann.updated_at else None
    }


def set_system_announcement(db: Session, message: str, banner_type: str, is_active: bool, admin_email: str):
    ann = db.query(SystemAnnouncement).order_by(SystemAnnouncement.id.desc()).first()
    if not ann:
        ann = SystemAnnouncement(
            message=message,
            banner_type=banner_type,
            is_active=is_active
        )
        db.add(ann)
    else:
        ann.message = message
        ann.banner_type = banner_type
        ann.is_active = is_active

    db.commit()
    db.refresh(ann)

    record_audit_log(
        db=db,
        admin_email=admin_email,
        action="SET_ANNOUNCEMENT",
        target_type="SYSTEM",
        target_id=str(ann.id),
        details=f"Announcement set: '{message[:30]}...' active={is_active}"
    )

    return {
        "id": ann.id,
        "message": ann.message,
        "banner_type": ann.banner_type,
        "is_active": ann.is_active,
        "updated_at": ann.updated_at.strftime("%Y-%m-%d %H:%M") if ann.updated_at else None
    }


def get_provider_categories_detail(db: Session, provider_id: int):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    all_categories = db.query(Category).filter(Category.is_active.is_(True)).all()
    assigned = (
        db.query(ProviderCategory)
        .filter(ProviderCategory.provider_id == provider_id, ProviderCategory.is_active.is_(True))
        .all()
    )
    assigned_cat_ids = {a.category_id for a in assigned}

    return {
        "provider_id": provider.id,
        "business_name": provider.business_name,
        "categories": [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "is_assigned": c.id in assigned_cat_ids
            }
            for c in all_categories
        ]
    }
