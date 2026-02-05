from pydantic import BaseModel
from typing import List, Optional

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
    current_aqi: float
    aqi_category: str
    weather: WeatherData