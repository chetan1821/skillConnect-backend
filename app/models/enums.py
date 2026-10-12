from enum import Enum


class UserRole(str, Enum):
    ADMIN = "Admin"
    PROVIDER = "Provider"
    CUSTOMER = "Customer"