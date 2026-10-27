from enum import Enum


class UserRole(str, Enum):
    ADMIN = "Admin"
    PROVIDER = "Provider"
    CUSTOMER = "Customer"


class BookingStatus(str, Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    DECLINED = "Declined"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
