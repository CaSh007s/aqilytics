from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.services.aqi_service import AQIService
from app.schemas import AQIPredictionResponse, AQIForecastResponse, BatchAQIRequest, BatchAQIResponse

router = APIRouter()
service = AQIService()

@router.get("/predict", response_model=AQIPredictionResponse)
async def predict_aqi(
    city: str = Query(None, description="Name of the city"),
    lat: float = Query(None, description="Latitude"),
    lon: float = Query(None, description="Longitude")
):
    """
    Get Real-time AQI prediction.
    Accepts either city name OR latitude/longitude.
    """
    try:
        if not city and (lat is None or lon is None):
            raise ValueError("You must provide either a city name or coordinates (lat, lon).")

        # The service handles the complex logic (Weather + Model)
        result = await service.get_realtime_aqi(city=city, lat=lat, lon=lon)
        # History saving removed
        return result
        
    except ValueError as e:
        # Handle "City not found" or "API Error" gracefully
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle unexpected crashes
        print(f"🔥 SERVER ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

# History endpoint removed for open access version

@router.get("/forecast", response_model=AQIForecastResponse)
async def get_aqi_forecast(city: str):
    try:
        service = AQIService()
        return await service.get_forecast(city)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch", response_model=List[BatchAQIResponse])
async def get_batch_aqi(request: BatchAQIRequest):
    """
    Get AQI for multiple cities.
    """
    return await service.get_batch_aqi(request.cities)