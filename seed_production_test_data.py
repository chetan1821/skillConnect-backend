"""
SkillConnect — Cloud / Production Test Data Seeder
Populates:
  - 30 High-Quality Service Categories
  - 15 Verified Customer Users (Password: User@123)
  - 15 Professional Service Providers & Wallets (Password: Provider@123)
  - Links Providers to relevant Categories
  - Initialized Provider Wallets
"""

import sys
from pathlib import Path
from decimal import Decimal

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.database.database import SessionLocal
from app.config.settings import settings
from app.models.user import User
from app.models.provider import Provider
from app.models.category import Category
from app.models.provider_category import ProviderCategory
from app.models.wallet import ProviderWallet
from app.models.enums import UserRole
from app.auth.password import hash_password

CATEGORIES_DATA = [
    {"name": "Electrical Installation & Repair", "description": "Short circuit fixing, switchboard installation, wiring inspection, and heavy load cabling."},
    {"name": "Plumbing Leakage & Pipe Fitting", "description": "Bathroom fittings, pipe leak repair, tap replacement, drainage unblocking, and valve fixes."},
    {"name": "AC Service & Gas Charging", "description": "Complete AC filter jet wash, cooling coil repair, gas leak detection, and compressor checkup."},
    {"name": "Carpentry & Custom Furniture", "description": "Door lock repairs, customized wardrobe assembly, kitchen cabinet hinges, and wooden repairs."},
    {"name": "House Painting & Waterproofing", "description": "Interior and exterior wall emulsion painting, damp proofing, primer, and putty finish."},
    {"name": "Deep Home & Kitchen Cleaning", "description": "Floor scrubbing, grease and chimney stain removal, bathroom descaling, and sanitized dusting."},
    {"name": "Pest Control & Termite Eradication", "description": "Odorless cockroach gel treatment, anti-termite wall drilling, bed bug extermination."},
    {"name": "Refrigerator & Freezer Repair", "description": "Cooling issues, defrost sensor repairs, thermostat replacements, and gas refilling."},
    {"name": "Washing Machine & Dryer Repair", "description": "Drum bearing replacement, PCB diagnosis, water drain pump repair, and motor fix."},
    {"name": "Water Purifier & RO Service", "description": "Filter membrane replacement, sediment candle change, TDS calibration, and pump service."},
    {"name": "CCTV & Smart Camera Installation", "description": "HD/IP camera mounting, DVR/NVR configuration, mobile remote view setup, and cable routing."},
    {"name": "Smart Home & IoT Automation", "description": "Smart switchboard relays, voice control integration (Alexa/Google), and smart lighting."},
    {"name": "Locksmith & High-Security Keying", "description": "Emergency door unlocking, deadbolt installation, smart digital door lock setup."},
    {"name": "Microwave & Induction Stove Repair", "description": "Magnetron replacement, heating element repair, touch panel replacement, and capacitor fix."},
    {"name": "Sofa & Upholstery Dry Cleaning", "description": "Vacuum deep cleaning, foam shampoo extraction, and sanitized fabric fabric treatment."},
    {"name": "Solar Panel Rooftop Installation", "description": "Solar grid inverter mounting, photovoltaic panel cleaning, battery bank setup."},
    {"name": "Bathroom Renovation & Tile Laying", "description": "Ceramic and vitrified tiling, tile regrouting, anti-skid bathroom floor laying."},
    {"name": "False Ceiling & Gypsum Design", "description": "Modern POP and Gypsum ceiling design, cove lighting channels, and acoustic panels."},
    {"name": "Gardening & Landscape Maintenance", "description": "Lawn mowing, hedge trimming, organic soil preparation, and drip irrigation maintenance."},
    {"name": "Roofing, Shed & Sheet Repair", "description": "GI sheet roofing, shed welding, monsoon leak sealing, and terrace canopy setup."},
    {"name": "Glass & Aluminum Window Fabrication", "description": "Sliding window track repair, toughened glass partition, and mosquito mesh net fitting."},
    {"name": "Masonry, Brickwork & Plastering", "description": "Wall crack plastering, small civil alterations, tile cutting, and structural patching."},
    {"name": "Kitchen Chimney & Hob Degreasing", "description": "Baffle filter deep cleaning, motor degreasing, duct pipe cleaning, and suction check."},
    {"name": "Inverter & UPS Battery Setup", "description": "Sine wave inverter sizing, tubular battery acid check, terminal cleaning, and backup wiring."},
    {"name": "Water Tank & Sump Sanitization", "description": "High-pressure jet wash, UV antibacterial tank treatment, and sludge extraction."},
    {"name": "Marble Polishing & Floor Grinding", "description": "Diamond pad marble grinding, silicate crystallization, and mirror finish polishing."},
    {"name": "Packers & Movers Shifting Support", "description": "Multi-layer bubble wrapping, furniture disassembly, loading, and relocation transit."},
    {"name": "Home Gym Equipment Assembly", "description": "Treadmill motor belt calibration, multi-gym cable routing, and barbell rack assembly."},
    {"name": "Geyser & Water Heater Service", "description": "Heating coil descaling, thermostat safety valve replacement, and anode rod fitting."},
    {"name": "Carpet & Rug Deep Sanitization", "description": "Industrial steam extraction, pet stain removal, and fiber-safe deodorizing treatment."}
]

CUSTOMERS_DATA = [
    {"full_name": "Aarav Sharma", "email": "aarav.sharma@example.com", "phone_number": "+91 98201 01001"},
    {"full_name": "Priya Patel", "email": "priya.patel@example.com", "phone_number": "+91 98201 01002"},
    {"full_name": "Rohit Verma", "email": "rohit.verma@example.com", "phone_number": "+91 98201 01003"},
    {"full_name": "Sneha Reddy", "email": "sneha.reddy@example.com", "phone_number": "+91 98201 01004"},
    {"full_name": "Amit Kumar", "email": "amit.kumar@example.com", "phone_number": "+91 98201 01005"},
    {"full_name": "Ananya Deshmukh", "email": "ananya.deshmukh@example.com", "phone_number": "+91 98201 01006"},
    {"full_name": "Vikram Malhotra", "email": "vikram.malhotra@example.com", "phone_number": "+91 98201 01007"},
    {"full_name": "Pooja Iyer", "email": "pooja.iyer@example.com", "phone_number": "+91 98201 01008"},
    {"full_name": "Rahul Joshi", "email": "rahul.joshi@example.com", "phone_number": "+91 98201 01009"},
    {"full_name": "Neha Singh", "email": "neha.singh@example.com", "phone_number": "+91 98201 01010"},
    {"full_name": "Kunal Gupta", "email": "kunal.gupta@example.com", "phone_number": "+91 98201 01011"},
    {"full_name": "Divya Nair", "email": "divya.nair@example.com", "phone_number": "+91 98201 01012"},
    {"full_name": "Manoj Tiwari", "email": "manoj.tiwari@example.com", "phone_number": "+91 98201 01013"},
    {"full_name": "Tanvi Shah", "email": "tanvi.shah@example.com", "phone_number": "+91 98201 01014"},
    {"full_name": "Siddharth Rao", "email": "siddharth.rao@example.com", "phone_number": "+91 98201 01015"}
]

PROVIDERS_DATA = [
    {
        "full_name": "Rajesh Sharma",
        "email": "rajesh.electricals@skillconnect.com",
        "phone_number": "+91 98111 20001",
        "business_name": "Apex Electrical & Wiring Works",
        "description": "Licensed master electrician with 8+ years specializing in residential wiring, load balancing, and emergency repairs.",
        "experience_years": 8,
        "visiting_fee": Decimal("199.00"),
        "hourly_rate": Decimal("350.00"),
        "categories": ["Electrical Installation & Repair", "Inverter & UPS Battery Setup"]
    },
    {
        "full_name": "Suresh Patil",
        "email": "suresh.plumbing@skillconnect.com",
        "phone_number": "+91 98111 20002",
        "business_name": "FastFlow Plumbing Solutions",
        "description": "Certified plumbing contractor handling pipeline leaks, sanitary fittings, and overhead tank setups.",
        "experience_years": 6,
        "visiting_fee": Decimal("199.00"),
        "hourly_rate": Decimal("300.00"),
        "categories": ["Plumbing Leakage & Pipe Fitting", "Water Tank & Sump Sanitization"]
    },
    {
        "full_name": "Imran Khan",
        "email": "coolbreeze.ac@skillconnect.com",
        "phone_number": "+91 98111 20003",
        "business_name": "CoolBreeze Air Conditioning Services",
        "description": "HVAC technician specializing in split & cassette AC jet wash, refrigerant gas charging, and PCB diagnostics.",
        "experience_years": 10,
        "visiting_fee": Decimal("249.00"),
        "hourly_rate": Decimal("400.00"),
        "categories": ["AC Service & Gas Charging", "Refrigerator & Freezer Repair"]
    },
    {
        "full_name": "Ramesh Suthar",
        "email": "ramesh.carpentry@skillconnect.com",
        "phone_number": "+91 98111 20004",
        "business_name": "Royal Woodcraft & Modular Solutions",
        "description": "Precision carpenter creating bespoke furniture, kitchen cabinet hinge alignments, and door adjustments.",
        "experience_years": 12,
        "visiting_fee": Decimal("199.00"),
        "hourly_rate": Decimal("350.00"),
        "categories": ["Carpentry & Custom Furniture", "False Ceiling & Gypsum Design"]
    },
    {
        "full_name": "Manoj Rathod",
        "email": "rainbow.painters@skillconnect.com",
        "phone_number": "+91 98111 20005",
        "business_name": "Rainbow House Painting & Damp Proofing",
        "description": "Professional residential painters offering dust-free roller painting, waterproof coating, and texture finishes.",
        "experience_years": 7,
        "visiting_fee": Decimal("149.00"),
        "hourly_rate": Decimal("250.00"),
        "categories": ["House Painting & Waterproofing", "Masonry, Brickwork & Plastering"]
    },
    {
        "full_name": "Sunita Kamble",
        "email": "sparkle.clean@skillconnect.com",
        "phone_number": "+91 98111 20006",
        "business_name": "SparkleClean Deep Cleaning Pros",
        "description": "Mechanized deep cleaning team with German vacuum machinery for complete home and kitchen sanitation.",
        "experience_years": 5,
        "visiting_fee": Decimal("299.00"),
        "hourly_rate": Decimal("350.00"),
        "categories": ["Deep Home & Kitchen Cleaning", "Sofa & Upholstery Dry Cleaning"]
    },
    {
        "full_name": "Deepak Mehta",
        "email": "safeshield.pest@skillconnect.com",
        "phone_number": "+91 98111 20007",
        "business_name": "SafeShield Pest Eradicators",
        "description": "Government licensed pest controller using odorless eco-friendly chemicals for termite and cockroach protection.",
        "experience_years": 9,
        "visiting_fee": Decimal("199.00"),
        "hourly_rate": Decimal("300.00"),
        "categories": ["Pest Control & Termite Eradication"]
    },
    {
        "full_name": "Arjun Deshmukh",
        "email": "quickfix.appliances@skillconnect.com",
        "phone_number": "+91 98111 20008",
        "business_name": "QuickFix Home Appliance Doctors",
        "description": "Multi-brand appliance technician for washing machines, microwave ovens, and induction stoves.",
        "experience_years": 6,
        "visiting_fee": Decimal("199.00"),
        "hourly_rate": Decimal("320.00"),
        "categories": ["Washing Machine & Dryer Repair", "Microwave & Induction Stove Repair"]
    },
    {
        "full_name": "Pradeep Yadav",
        "email": "pureflow.ro@skillconnect.com",
        "phone_number": "+91 98111 20009",
        "business_name": "PureFlow Water Purifier Care",
        "description": "RO and UV water purifier specialist with genuine OEM membrane filters and mineral cartridges.",
        "experience_years": 5,
        "visiting_fee": Decimal("149.00"),
        "hourly_rate": Decimal("280.00"),
        "categories": ["Water Purifier & RO Service", "Geyser & Water Heater Service"]
    },
    {
        "full_name": "Vikrant Bose",
        "email": "securevision.cctv@skillconnect.com",
        "phone_number": "+91 98111 20010",
        "business_name": "SecureVision Smart Security Systems",
        "description": "Certified surveillance expert installing IP cameras, video door phones, and smart home IoT sensors.",
        "experience_years": 8,
        "visiting_fee": Decimal("249.00"),
        "hourly_rate": Decimal("400.00"),
        "categories": ["CCTV & Smart Camera Installation", "Smart Home & IoT Automation"]
    },
    {
        "full_name": "Mahesh Solanki",
        "email": "masterkey.locksmith@skillconnect.com",
        "phone_number": "+91 98111 20011",
        "business_name": "MasterKey Fast Locksmith Services",
        "description": "Rapid response locksmith for locked doors, duplicate laser-cut keys, and biometric lock setups.",
        "experience_years": 11,
        "visiting_fee": Decimal("199.00"),
        "hourly_rate": Decimal("300.00"),
        "categories": ["Locksmith & High-Security Keying", "Glass & Aluminum Window Fabrication"]
    },
    {
        "full_name": "Kavita Rao",
        "email": "greenthumb.gardens@skillconnect.com",
        "phone_number": "+91 98111 20012",
        "business_name": "GreenThumb Landscaping & Gardening",
        "description": "Landscape designer offering terrace garden development, seasonal pruning, and lawn grass laying.",
        "experience_years": 7,
        "visiting_fee": Decimal("199.00"),
        "hourly_rate": Decimal("250.00"),
        "categories": ["Gardening & Landscape Maintenance"]
    },
    {
        "full_name": "Santosh Tiwari",
        "email": "precision.tiles@skillconnect.com",
        "phone_number": "+91 98111 20013",
        "business_name": "Precision Tile & Marble Works",
        "description": "Italian marble grinding, epoxy tile regrouting, and bathroom floor slope correction specialist.",
        "experience_years": 13,
        "visiting_fee": Decimal("249.00"),
        "hourly_rate": Decimal("400.00"),
        "categories": ["Bathroom Renovation & Tile Laying", "Marble Polishing & Floor Grinding"]
    },
    {
        "full_name": "Harish Joshi",
        "email": "sunpower.solar@skillconnect.com",
        "phone_number": "+91 98111 20014",
        "business_name": "SunPower Solar Energy Solutions",
        "description": "MNRE-certified solar installer providing rooftop on-grid net metering and off-grid battery systems.",
        "experience_years": 9,
        "visiting_fee": Decimal("299.00"),
        "hourly_rate": Decimal("450.00"),
        "categories": ["Solar Panel Rooftop Installation", "Roofing, Shed & Sheet Repair"]
    },
    {
        "full_name": "Gaurav Malhotra",
        "email": "express.movers@skillconnect.com",
        "phone_number": "+91 98111 20015",
        "business_name": "Express Movers & Equipment Technicians",
        "description": "Trained logistics and heavy furniture assembly technicians for home fitness gyms and safe relocation.",
        "experience_years": 6,
        "visiting_fee": Decimal("299.00"),
        "hourly_rate": Decimal("350.00"),
        "categories": ["Packers & Movers Shifting Support", "Home Gym Equipment Assembly"]
    }
]


def seed_database():
    db_host = settings.DATABASE_URL.split("@")[-1].split("?")[0] if "@" in settings.DATABASE_URL else settings.DATABASE_URL
    print("=" * 65)
    print("      SkillConnect — Cloud Production Test Data Seeder       ")
    print("=" * 65)
    print(f"[DB TARGET]: {db_host}\n")

    db = SessionLocal()
    user_pw_hash = hash_password("User@123")
    provider_pw_hash = hash_password("Provider@123")

    try:
        # -------------------------------------------------------------
        # 1. Seed 30 Service Categories
        # -------------------------------------------------------------
        print("[1/3] Seeding 30 Service Categories...")
        category_map = {}
        created_cat_count = 0

        for cat_data in CATEGORIES_DATA:
            cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not cat:
                cat = Category(
                    name=cat_data["name"],
                    description=cat_data["description"],
                    is_active=True
                )
                db.add(cat)
                db.flush()
                created_cat_count += 1
            else:
                cat.description = cat_data["description"]
                cat.is_active = True

            category_map[cat.name] = cat.id

        db.commit()
        print(f"  -> Processed {len(CATEGORIES_DATA)} categories (New: {created_cat_count}, Existing: {len(CATEGORIES_DATA) - created_cat_count})")

        # -------------------------------------------------------------
        # 2. Seed 15 Customer Users
        # -------------------------------------------------------------
        print("\n[2/3] Seeding 15 Customer Users (Password: User@123)...")
        created_user_count = 0

        for u_data in CUSTOMERS_DATA:
            user = db.query(User).filter(User.email == u_data["email"].lower()).first()
            if not user:
                user = User(
                    full_name=u_data["full_name"],
                    email=u_data["email"].lower(),
                    phone_number=u_data["phone_number"],
                    password=user_pw_hash,
                    role=UserRole.CUSTOMER.value,
                    is_active=True
                )
                db.add(user)
                created_user_count += 1
            else:
                user.password = user_pw_hash
                user.role = UserRole.CUSTOMER.value
                user.is_active = True
                user.phone_number = u_data["phone_number"]

        db.commit()
        print(f"  -> Processed {len(CUSTOMERS_DATA)} customers (New: {created_user_count}, Existing: {len(CUSTOMERS_DATA) - created_user_count})")

        # -------------------------------------------------------------
        # 3. Seed 15 Providers & Associated Wallets & Categories
        # -------------------------------------------------------------
        print("\n[3/3] Seeding 15 Service Providers & Wallets (Password: Provider@123)...")
        created_prov_count = 0

        for p_data in PROVIDERS_DATA:
            # 3a. User account for provider
            p_user = db.query(User).filter(User.email == p_data["email"].lower()).first()
            if not p_user:
                p_user = User(
                    full_name=p_data["full_name"],
                    email=p_data["email"].lower(),
                    phone_number=p_data["phone_number"],
                    password=provider_pw_hash,
                    role=UserRole.PROVIDER.value,
                    is_active=True
                )
                db.add(p_user)
                db.flush()
            else:
                p_user.password = provider_pw_hash
                p_user.role = UserRole.PROVIDER.value
                p_user.is_active = True

            # 3b. Provider profile
            provider = db.query(Provider).filter(Provider.user_id == p_user.id).first()
            if not provider:
                provider = Provider(
                    user_id=p_user.id,
                    business_name=p_data["business_name"],
                    description=p_data["description"],
                    experience_years=p_data["experience_years"],
                    visiting_fee=p_data["visiting_fee"],
                    hourly_rate=p_data["hourly_rate"],
                    is_verified=True,
                    is_active=True
                )
                db.add(provider)
                db.flush()
                created_prov_count += 1
            else:
                provider.business_name = p_data["business_name"]
                provider.description = p_data["description"]
                provider.experience_years = p_data["experience_years"]
                provider.visiting_fee = p_data["visiting_fee"]
                provider.hourly_rate = p_data["hourly_rate"]
                provider.is_verified = True
                provider.is_active = True

            # 3c. Ensure Provider Wallet exists
            wallet = db.query(ProviderWallet).filter(ProviderWallet.provider_id == provider.id).first()
            if not wallet:
                wallet = ProviderWallet(
                    provider_id=provider.id,
                    available_balance=Decimal("0.00"),
                    pending_balance=Decimal("0.00"),
                    total_withdrawn=Decimal("0.00")
                )
                db.add(wallet)

            # 3d. Link to Categories
            for cat_name in p_data.get("categories", []):
                cat_id = category_map.get(cat_name)
                if cat_id:
                    link = db.query(ProviderCategory).filter(
                        ProviderCategory.provider_id == provider.id,
                        ProviderCategory.category_id == cat_id
                    ).first()
                    if not link:
                        link = ProviderCategory(
                            provider_id=provider.id,
                            category_id=cat_id,
                            is_active=True
                        )
                        db.add(link)

        db.commit()
        print(f"  -> Processed {len(PROVIDERS_DATA)} providers (New: {created_prov_count}, Existing: {len(PROVIDERS_DATA) - created_prov_count})")

        print("\n" + "=" * 65)
        print("          TEST DATA SEEDING COMPLETED SUCCESSFULLY!          ")
        print("=" * 65)
        print(f"Total Service Categories: {len(CATEGORIES_DATA)}")
        print(f"Total Customers:          {len(CUSTOMERS_DATA)}  (Password: User@123)")
        print(f"Total Providers:          {len(PROVIDERS_DATA)}  (Password: Provider@123)")
        print("=" * 65)

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

