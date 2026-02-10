from fastapi import APIRouter, HTTPException, Query
from app.services.aqi_service import AQIService
from app.schemas import AQIPredictionResponse, AQIForecastResponse

router = APIRouter()
service = AQIService()

@router.get("/predict", response_model=AQIPredictionResponse)
async def predict_aqi(
    city: str = Query(..., description="Name of the city to predict AQI for")
):
    """
    Get Real-time AQI prediction for a specific city.
    Uses XGBoost Model + OpenWeatherMap (or Mock fallback).
    """
    try:
        # The service handles the complex logic (Weather + Model)
        result = await service.get_realtime_aqi(city)
        return result
        
    except ValueError as e:
        # Handle "City not found" or "API Error" gracefully
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Handle unexpected crashes
        print(f"🔥 SERVER ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
@router.get("/forecast", response_model=AQIForecastResponse)
async def get_aqi_forecast(city: str):
    try:
        service = AQIService()
        return await service.get_forecast(city)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))