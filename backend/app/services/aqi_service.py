import httpx
from app.core.config import settings
from app.ml.predict import AQIPredictor

# Initialize the model loader ONCE at module level
predictor = AQIPredictor()

class AQIService:
    def __init__(self):
        self.weather_url = "https://api.openweathermap.org/data/2.5/weather"
    
    async def get_realtime_aqi(self, city: str):
        # 1. Fetch live weather from OpenWeatherMap
        weather_data = {}
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.weather_url, params={
                    "q": city,
                    "appid": settings.OPENWEATHER_API_KEY,
                    "units": "metric"
                })
                
                # Check for 401 specifically (Activation Delay)
                if response.status_code == 401:
                    print(f"⚠️ OWM Key invalid or not active yet. Using MOCK data for {city}.")
                    weather_data = self._get_mock_weather()
                elif response.status_code != 200:
                    print(f"⚠️ OWM Error {response.status_code}. Using MOCK data for {city}.")
                    weather_data = self._get_mock_weather()
                else:
                    data = response.json()
                    weather_data = {
                        "temp": data["main"]["temp"],
                        "humidity": data["main"]["humidity"],
                        "wind_speed": data["wind"]["speed"],
                        "pressure": data["main"]["pressure"]
                    }
                    
        except Exception as e:
            print(f"⚠️ Connection Error: {e}. Using MOCK data.")
            weather_data = self._get_mock_weather()

        # 2. Extract features needed for the model
        model_features = {
            "month": 2,      
            "day_of_week": 3, 
            "PM2.5": 120.0,   # High value to test "Poor" category
            "PM10": 150.0,
            "NO2": 40.0,
            "NH3": 25.0,
            "SO2": 20.0,
            "CO": 2.0,
            "Ozone": 50.0,
        }
        
        # 3. Predict AQI using our XGBoost Model
        predicted_aqi = predictor.predict(model_features)
        
        # 4. Determine Category
        category = self._get_category(predicted_aqi)

        return {
            "city": city,
            "current_aqi": round(predicted_aqi, 2),
            "aqi_category": category,
            "weather": weather_data
        }

    def _get_mock_weather(self):
        """Fallback data for dev when API is down/inactive"""
        return {
            "temp": 28.5,
            "humidity": 65.0,
            "wind_speed": 4.2,
            "pressure": 1012.0
        }

    def _get_category(self, aqi):
        if aqi <= 50: return "Good"
        if aqi <= 100: return "Satisfactory"
        if aqi <= 200: return "Moderate"
        if aqi <= 300: return "Poor"
        if aqi <= 400: return "Very Poor"
        return "Severe"