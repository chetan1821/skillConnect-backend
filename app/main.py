from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.database.database import engine
from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.public import router as public_router
from app.routes.bookings import router as bookings_router

app = FastAPI(
    title="SkillConnect API",
    description="Backend REST API for SkillConnect Platform with JWT RBAC Security & Service Booking Engine",
    version="1.0.0"
)

# -------------------------------------------------------------
# 1. Security Headers Middleware
# -------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# -------------------------------------------------------------
# 2. CORS Middleware Configuration
# -------------------------------------------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# -------------------------------------------------------------
# 3. Mount Application Routers
# -------------------------------------------------------------
app.include_router(public_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(bookings_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to SkillConnect API 🚀",
        "status": "healthy",
        "security": "JWT RBAC Enabled",
        "engine": "Service Booking Engine Active"
    }
