"""
SkillConnect Database Seeder
Safely populates initial service categories and sample providers if they do not exist.
"""
from app.database.database import SessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.provider import Provider
from app.models.provider_category import ProviderCategory
from app.models.enums import UserRole
from app.auth.password import hash_password

CATEGORIES_SEED = [
    {"name": "Electrical Services", "description": "Wiring, circuit breakers, installations, and smart home setup."},
    {"name": "Plumbing & Piping", "description": "Leak fixes, sanitary fittings, water heaters, and pipe repairs."},
    {"name": "Carpentry & Woodwork", "description": "Custom furniture, modular kitchens, door fittings, and repairs."},
    {"name": "HVAC & AC Service", "description": "AC installation, cooling maintenance, and deep coil cleaning."},
    {"name": "Appliance Repair", "description": "Washing machines, refrigerators, microwave ovens, and dishwashers."},
    {"name": "Deep Home Cleaning", "description": "Full home sanitation, steam cleaning, and kitchen degreasing."},
    {"name": "Painting & Waterproofing", "description": "Interior/exterior wall painting and moisture barrier treatments."},
    {"name": "Pest Control & Sanitization", "description": "Eco-friendly termite, rodent, and insect pest control."}
]

def seed():
    db = SessionLocal()
    try:
        print("--- Seeding SkillConnect Database ---")

        # 1. Categories
        cat_map = {}
        for c_data in CATEGORIES_SEED:
            existing = db.query(Category).filter(Category.name.ilike(c_data["name"])).first()
            if not existing:
                cat = Category(name=c_data["name"], description=c_data["description"], is_active=True)
                db.add(cat)
                db.flush()
                print(f"[+] Added Category: {cat.name}")
                cat_map[cat.name] = cat
            else:
                cat_map[existing.name] = existing

        db.commit()

        # 2. Check / Create Provider User
        provider_email = "vikram@apexelectrical.com"
        provider_user = db.query(User).filter(User.email == provider_email).first()
        if not provider_user:
            provider_user = User(
                full_name="Vikram Sharma",
                email=provider_email,
                phone_number="+91 98765 43210",
                password=hash_password("Provider@123"),
                role=UserRole.PROVIDER.value,
                is_active=True
            )
            db.add(provider_user)
            db.commit()
            db.refresh(provider_user)
            print(f"[+] Created Provider User: {provider_user.email}")

        # 3. Provider Profile
        existing_provider = db.query(Provider).filter(Provider.user_id == provider_user.id).first()
        if not existing_provider:
            provider = Provider(
                user_id=provider_user.id,
                business_name="Apex Precision Electricals",
                description="Master certified electrician with 12+ years experience in domestic wiring and solar backup installations.",
                experience_years=12,
                is_verified=True,
                is_active=True
            )
            db.add(provider)
            db.commit()
            db.refresh(provider)
            print(f"[+] Created Provider Profile: {provider.business_name}")

            # 4. Assign Category
            elec_cat = db.query(Category).filter(Category.name.ilike("Electrical Services%")).first()
            if elec_cat:
                pc = ProviderCategory(provider_id=provider.id, category_id=elec_cat.id, is_active=True)
                db.add(pc)
                db.commit()
                print(f"[+] Assigned Category '{elec_cat.name}' to provider '{provider.business_name}'")

        print("Database seeding completed successfully! ✨")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

