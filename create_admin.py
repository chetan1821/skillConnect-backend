"""
SkillConnect — Admin User Creation Utility
Usage:
    Interactive prompt:
        python create_admin.py

    Direct command-line arguments:
        python create_admin.py --name "Super Admin" --email admin@skillconnect.com --phone "+91 99999 11111" --password "Admin@123"
"""
import sys
from pathlib import Path
import argparse
from getpass import getpass

# Add backend directory to sys.path
current_dir = Path(__file__).resolve().parent
if (current_dir / "app").exists():
    sys.path.insert(0, str(current_dir))
elif (current_dir / "skillConnect-backend" / "app").exists():
    sys.path.insert(0, str(current_dir / "skillConnect-backend"))

from app.database.database import SessionLocal
from app.config.settings import settings
from app.models.user import User
from app.models.enums import UserRole
from app.auth.password import hash_password


def create_or_promote_admin(full_name: str, email: str, phone: str, password: str):
    db_host = settings.DATABASE_URL.split("@")[-1].split("?")[0] if "@" in settings.DATABASE_URL else settings.DATABASE_URL
    print(f"\n[INFO] Connected to Database: {db_host}")
    db = SessionLocal()
    email_clean = email.strip().lower()
    phone_clean = phone.strip()

    try:
        # Check if email exists
        user = db.query(User).filter(User.email == email_clean).first()

        if user:
            print(f"\n[!] A user with email '{email_clean}' already exists (ID: {user.id}, Role: {user.role}).")
            choice = input("Do you want to promote this user to Admin and update their password? (y/N): ").strip().lower()
            if choice == 'y':
                user.role = UserRole.ADMIN.value
                user.is_active = True
                user.password = hash_password(password)
                if full_name:
                    user.full_name = full_name.strip()
                if phone_clean:
                    user.phone_number = phone_clean
                db.commit()
                print(f"[SUCCESS] User '{user.email}' has been successfully updated to ADMIN!")
            else:
                print("Operation aborted. No changes were made.")
                return
        else:
            # Check phone uniqueness
            existing_phone = db.query(User).filter(User.phone_number == phone_clean).first()
            if existing_phone:
                print(f"\n[ERROR] Phone number '{phone_clean}' is already assigned to user '{existing_phone.email}'.")
                return

            new_admin = User(
                full_name=full_name.strip(),
                email=email_clean,
                phone_number=phone_clean,
                password=hash_password(password),
                role=UserRole.ADMIN.value,
                is_active=True
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)

            print("\n========================================================")
            print("  ADMIN ACCOUNT CREATED SUCCESSFULLY! ")
            print("========================================================")
            print(f"  ID:       {new_admin.id}")
            print(f"  Name:     {new_admin.full_name}")
            print(f"  Email:    {new_admin.email}")
            print(f"  Phone:    {new_admin.phone_number}")
            print(f"  Role:     {new_admin.role}")
            print("========================================================")
            print("You can now open your frontend, click 'Sign In',")
            print("and log in with this email and password.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to create admin: {e}")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Create or promote an administrator account for SkillConnect")
    parser.add_argument("--name", help="Full name of administrator")
    parser.add_argument("--email", help="Email address of administrator")
    parser.add_argument("--phone", help="Phone number of administrator")
    parser.add_argument("--password", help="Password (min 8 characters)")

    args = parser.parse_args()

    # If flags are provided via CLI
    if args.email and args.password:
        name = args.name or "Platform Administrator"
        phone = args.phone or "+91 99999 00000"
        create_or_promote_admin(name, args.email, phone, args.password)
        return

    # Otherwise run interactively
    print("========================================================")
    print("       SkillConnect — Create Administrator Account      ")
    print("========================================================")

    full_name = input("Enter Admin Full Name [Platform Administrator]: ").strip()
    if not full_name:
        full_name = "Platform Administrator"

    email = input("Enter Admin Email (e.g. admin@skillconnect.com): ").strip()
    while not email or "@" not in email:
        print("[!] Please enter a valid email address.")
        email = input("Enter Admin Email: ").strip()

    phone = input("Enter Admin Phone Number [+91 99999 00000]: ").strip()
    if not phone:
        phone = "+91 99999 00000"

    # Password input
    try:
        password = getpass("Enter Admin Password (min 8 characters): ").strip()
    except Exception:
        password = input("Enter Admin Password (min 8 characters): ").strip()

    while len(password) < 8:
        print("[!] Password must be at least 8 characters long.")
        try:
            password = getpass("Enter Admin Password (min 8 characters): ").strip()
        except Exception:
            password = input("Enter Admin Password (min 8 characters): ").strip()

    create_or_promote_admin(full_name, email, phone, password)


if __name__ == "__main__":
    main()
