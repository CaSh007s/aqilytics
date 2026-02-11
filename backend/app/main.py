from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import aqi 
from app.routers import auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.PROJECT_NAME} Backend Starting...")
    # Trigger model loading immediately on startup
    from app.services.aqi_service import predictor 
    if predictor.model:
        print("✅ XGBoost Model is warm and ready.")
    else:
        print("⚠️ Model not found. Predictions might fail.")
    yield
    print("🛑 Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan
)

#CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Next.js runs here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register Routes ---
app.include_router(aqi.router, prefix="/api/v1/aqi", tags=["AQI"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])

@app.get("/")
async def root():
    return {"message": "Aeronomy API is Operational"}

@app.get("/health")
async def health():
    return {"status": "ok"}