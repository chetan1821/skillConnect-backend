from fastapi import FastAPI
from app.database.database import engine

app = FastAPI(
    title="SkillConnect API",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to SkillConnect API 🚀"
    }
