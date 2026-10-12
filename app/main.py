from fastapi import FastAPI
from app.database.database import engine
from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router

app = FastAPI(
    title="SkillConnect API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(admin_router)
@app.get("/")
def root():
    return {
        "message": "Welcome to SkillConnect API 🚀"
    }
