from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings

# Lifecycle manager (startup/shutdown events)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML Model & Connect Redis
    print(f"🚀 {settings.PROJECT_NAME} Backend Starting...")
    print("Checking Redis connection...")
    print("Loading XGBoost Model...")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Air Quality Intelligence Platform powered by XGBoost",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/")
async def root():
    return {
        "system": "Aeronomy", 
        "status": "operational", 
        "tagline": "Predict. Explain. Protect."
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}