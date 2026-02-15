from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

# --- Shared Parts ---
class WeatherData(BaseModel):
    temp: float
    humidity: float
    wind_speed: float
    pressure: float

# --- Request ---
class AQIPredictionRequest(BaseModel):
    city: str

# --- Response ---
class AQIPredictionResponse(BaseModel):
    city: str
    country: str
    current_aqi: float
    aqi_category: str
    weather: WeatherData
    pollutants: Dict[str, float]

class ForecastPoint(BaseModel):
    time: int
    aqi: float
    pollutants: Dict[str, float]

class AQIForecastResponse(BaseModel):
    city: str
    forecast: List[ForecastPoint]

# UserData removed

class AnalysisResponse(BaseModel):
    id: str
    user_id: str
    city: str
    current_aqi: float
    aqi_category: str
    created_at: str
    # pollutants and weather are simple dicts in response if needed
# --- History ---
class HistoryCreate(BaseModel):
    session_id: str
    city: str
    aqi_value: int
    aqi_category: str
    full_snapshot: Dict[str, Any]

class HistoryResponse(BaseModel):
    id: str
    session_id: str
    city: str
    aqi_value: int
    aqi_category: str
    created_at: datetime
    full_snapshot: Dict[str, Any]
