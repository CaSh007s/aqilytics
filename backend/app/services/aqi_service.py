import httpx
from app.core.config import settings
from app.ml.predict import AQIPredictor
from app.schemas import AQIPredictionResponse, AQIForecastResponse, ForecastPoint, AnalysisResponse
from app.core.database import supabase

# Initialize the model loader ONCE at module level
predictor = AQIPredictor()

class AQIService:
    def __init__(self):
        self.weather_url = "https://api.openweathermap.org/data/2.5/weather"
        self.pollution_url = "https://api.openweathermap.org/data/2.5/air_pollution"
    
    async def get_realtime_aqi(self, city: str) -> dict:
        weather_data = {}
        pollutants = {}
        
        async with httpx.AsyncClient() as client:
            # --- STEP 1: Get Weather & Coordinates ---
            w_response = await client.get(self.weather_url, params={
                "q": city,
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric"
            })
            
            # STRICT CHECK: If city is not found (404), STOP immediately.
            if w_response.status_code == 404:
                print(f"❌ City '{city}' not found.")
                raise ValueError(f"City '{city}' not found.")

            # Check for API Key issues (401)
            if w_response.status_code == 401:
                print(f"⚠️ API Key Error. Check .env file.")
                raise ValueError("Server Configuration Error (Invalid API Key)")

            w_data = w_response.json()
            lat = w_data["coord"]["lat"]
            lon = w_data["coord"]["lon"]
            
            weather_data = {
                "temp": w_data["main"]["temp"],
                "humidity": w_data["main"]["humidity"],
                "wind_speed": w_data["wind"]["speed"],
                "pressure": w_data["main"]["pressure"]
            }

            # --- STEP 2: Get Real Pollution Data ---
            p_response = await client.get(self.pollution_url, params={
                "lat": lat,
                "lon": lon,
                "appid": settings.OPENWEATHER_API_KEY
            })

            if p_response.status_code == 200:
                p_data = p_response.json()
                # OWM returns list of components. We grab the first (current).
                components = p_data["list"][0]["components"]
                
                # Map OWM keys (lowercase) to Model Features (Standard Chemical Names)
                pollutants = {
                    "PM2.5": components.get("pm2_5", 0),
                    "PM10": components.get("pm10", 0),
                    "NO2": components.get("no2", 0),
                    "NH3": components.get("nh3", 0),
                    "SO2": components.get("so2", 0),
                    "CO": components.get("co", 0),
                    "Ozone": components.get("o3", 0),
                }
            else:
                # Fallback if pollution endpoint fails but weather worked
                print(f"⚠️ Pollution data unavailable for {city}.")
                pollutants = {k: 0 for k in ["PM2.5", "PM10", "NO2", "NH3", "SO2", "CO", "Ozone"]}

        # --- STEP 3: Predict AQI using Real Data ---
        model_features = {
            "month": 2,       
            "day_of_week": 4, 
            **pollutants,     
        }
        
        predicted_aqi = predictor.predict(model_features)
        category = self._get_category(predicted_aqi)

        return {
            "city": w_data["name"],
            "country": w_data["sys"]["country"],
            "current_aqi": round(predicted_aqi, 2),
            "aqi_category": category,
            "weather": weather_data,
            "pollutants": pollutants
        }
    
    async def get_forecast(self, city: str) -> AQIForecastResponse:
        """
        Fetches 24-hour pollution forecast and runs ML predictions for each hour.
        """
        forecast_url = "https://api.openweathermap.org/data/2.5/air_pollution/forecast"
        
        async with httpx.AsyncClient() as client:
            # 1. Get Coordinates (Re-using weather call logic for simplicity)
            # In a real app, we'd cache the coords, but this is fine for now.
            w_response = await client.get(self.weather_url, params={
                "q": city, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"
            })
            if w_response.status_code != 200: raise ValueError("City not found")
            
            lat = w_response.json()["coord"]["lat"]
            lon = w_response.json()["coord"]["lon"]

            # 2. Get Forecast Data
            f_response = await client.get(forecast_url, params={
                "lat": lat, "lon": lon, "appid": settings.OPENWEATHER_API_KEY
            })
            
            if f_response.status_code != 200: 
                raise ValueError("Remote forecast service unavailable")
            
            f_data = f_response.json()
            hourly_predictions = []

            # 3. Process next 24 hours
            for item in f_data["list"][:24]:
                components = item["components"]
                
                # Prepare features for the model
                model_features = {
                    "month": 2, # Static for MVP
                    "day_of_week": 4, 
                    "PM2.5": components.get("pm2_5", 0),
                    "PM10": components.get("pm10", 0),
                    "NO2": components.get("no2", 0),
                    "NH3": components.get("nh3", 0),
                    "SO2": components.get("so2", 0),
                    "CO": components.get("co", 0),
                    "Ozone": components.get("o3", 0),
                }
                
                # RUN ML PREDICTION
                pred_aqi = predictor.predict(model_features)
                
                hourly_predictions.append(ForecastPoint(
                    time=item["dt"],
                    aqi=round(pred_aqi, 1),
                    pollutants={
                        "PM2.5": components.get("pm2_5", 0),
                        "PM10": components.get("pm10", 0),
                        "NO2": components.get("no2", 0),
                        "Ozone": components.get("o3", 0),
                        "SO2": components.get("so2", 0),
                    }
                ))
                
            return AQIForecastResponse(city=city, forecast=hourly_predictions)

    def _get_category(self, aqi):
        if aqi <= 50: return "Good"
        if aqi <= 100: return "Satisfactory"
        if aqi <= 200: return "Moderate"
        if aqi <= 300: return "Poor"
        if aqi <= 400: return "Very Poor"
        return "Severe"

    async def save_analysis(self, user_id: str, data: dict):
        try:
            # Prepare payload matching table structure
            payload = {
                "user_id": user_id,
                "city": data["city"],
                "country": data["country"],
                "current_aqi": data["current_aqi"],
                "aqi_category": data["aqi_category"],
                "pollutants": data["pollutants"], 
                "weather": data["weather"],
            }
            # Add logging to debug
            print(f"DEBUG: Saving analysis for {user_id} - City: {data['city']}")
            supabase.table("analyses").insert(payload).execute()
        except Exception as e:
            print(f"⚠️ Failed to save analysis history: {e}")

    async def get_history(self, user_id: str):
        try:
            response = supabase.table("analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
            print(f"DEBUG: Fetched history for {user_id}: {len(response.data) if response.data else 0} items")
            return response.data or []
        except Exception as e:
            print(f"⚠️ Failed to fetch history: {e}")
            return []