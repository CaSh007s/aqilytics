from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import aqi 

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
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://aqilytics.vercel.app",
        "https://aqilytics.onrender.com",
        "https://aqilytics-jr7j3m918-cash007s-projects.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth router removed
app.include_router(aqi.router, prefix="/api/v1/aqi", tags=["aqi"])


@app.get("/")
def read_root():
    return {"message": "AQILYTICS API is running 🚀"}