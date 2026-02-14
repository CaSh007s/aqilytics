from fastapi import APIRouter, HTTPException, Query
from app.services.aqi_service import AQIService
from app.schemas import AQIPredictionResponse, AQIForecastResponse, AnalysisResponse, UserData
from app.dependencies import get_optional_user, get_current_user
from fastapi import Depends

router = APIRouter()
service = AQIService()

@router.get("/predict", response_model=AQIPredictionResponse)
async def predict_aqi(
    city: str = Query(..., description="Name of the city to predict AQI for"),
    user: UserData | None = Depends(get_optional_user)
):
    """
    Get Real-time AQI prediction for a specific city.
    Uses XGBoost Model + OpenWeatherMap (or Mock fallback).
    """
    try:
        # The service handles the complex logic (Weather + Model)
        result = await service.get_realtime_aqi(city)
        
        # Save history if user is logged in
        if user:
            await service.save_analysis(user.id, result)
            
        return result
        
    except ValueError as e:
        # Handle "City not found" or "API Error" gracefully
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Handle unexpected crashes
        print(f"🔥 SERVER ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@router.get("/history", response_model=list[AnalysisResponse])
@router.get("/history", response_model=list[AnalysisResponse])
async def get_history(user: UserData = Depends(get_current_user)):
    try:
        service = AQIService()
        history = await service.get_history(user.id)
        print(f"DEBUG: Fetched history for {user.id}: {len(history)} items")
        return history
    except Exception as e:
        print(f"🔥 HISTORY ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast", response_model=AQIForecastResponse)
async def get_aqi_forecast(city: str):
    try:
        service = AQIService()
        return await service.get_forecast(city)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))